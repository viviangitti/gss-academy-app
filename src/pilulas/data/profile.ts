// Perfil do usuário guardado NA CONTA (Firestore), não no aparelho — assim o papel
// (gestor/vendedora), o nome e o canal valem em qualquer celular onde a pessoa logar.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Role, AffiliateType } from '../AuthContext';
import { normalizeRole } from './roles';
import type { SegmentId } from './segments';
import { BRANDS, type BrandId } from './brands';
import { ehCargoAuto, type CargoAuto } from './cargos';

export interface ElevaProfile {
  role: Role; // o perfil PRINCIPAL — é o que o app usa pra montar a experiência
  roles?: Role[]; // todos os perfis marcados no cadastro (a pessoa pode ser mais de um)
  name?: string;
  segment?: SegmentId | '';
  affiliateType?: AffiliateType | ''; // só quando role === 'afiliado'
  cargo?: CargoAuto; // concessionária: vendedor/gerente de veículos ou de acessórios
  brands?: BrandId[]; // marca(s) que a pessoa vê — ex.: ['dsp'] p/ Drogaria São Paulo
  loja?: string;      // unidade do grupo (Tiger Goiânia, Anápolis, Itumbiara)
  whatsapp?: string;  // vai no material que ela manda pro cliente (só dela, nunca de terceiro)
  foto?: string;      // retrato do vendedor no material (data URL pequena)
}

export async function getElevaProfile(uid: string): Promise<ElevaProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'elevaUsers', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    const role: Role = normalizeRole(d.role) ?? 'balconista';
    const at = d.affiliateType;
    const rawBrands = Array.isArray(d.brands) ? d.brands : undefined;
    const brands = rawBrands?.filter((b: unknown) => BRANDS.some((x) => x.id === b)) as BrandId[] | undefined;
    return {
      role,
      name: typeof d.name === 'string' ? d.name : undefined,
      segment: typeof d.segment === 'string' ? (d.segment as SegmentId | '') : undefined,
      affiliateType: at === 'geral' || at === 'saude' ? at : undefined,
      cargo: ehCargoAuto(d.cargo) ? d.cargo : undefined,
      loja: typeof d.loja === 'string' ? d.loja : undefined,
      whatsapp: typeof d.whatsapp === 'string' ? d.whatsapp : undefined,
      foto: typeof d.foto === 'string' ? d.foto : undefined,
      brands: brands && brands.length ? brands : undefined,
    };
  } catch {
    return null;
  }
}

// Atualiza SÓ o nome (merge) — sem tocar em papel/marcas. Usado no Perfil.
export async function updateElevaName(uid: string, name: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'elevaUsers', uid), { name: name.trim(), updatedAt: serverTimestamp() }, { merge: true });
  } catch { /* offline / sem permissão */ }
}

// WhatsApp que sai no material enviado ao cliente. Guardado na CONTA, não no
// aparelho: quem troca de celular não perde, e o material continua com o
// contato certo. Só a própria pessoa lê e grava o dela (regra do Firestore).
export async function updateElevaWhatsapp(uid: string, whatsapp: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'elevaUsers', uid), { whatsapp: whatsapp.trim(), updatedAt: serverTimestamp() }, { merge: true });
  } catch { /* offline / sem permissão */ }
}

/**
 * Retrato do vendedor, guardado na conta.
 *
 * Vem como data URL já reduzida (ver `retratoParaDataUrl`): documento do
 * Firestore tem teto de 1 MB, e selfie de celular chega com 4 MB. Reduzir aqui
 * também faz o material montar rápido no 4G do showroom.
 */
export async function updateElevaFoto(uid: string, foto: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'elevaUsers', uid), { foto, updatedAt: serverTimestamp() }, { merge: true });
  } catch { /* offline / sem permissão */ }
}

/** Recorta no quadrado do meio e reduz pra 320px — é o tamanho que o material usa. */
export function retratoParaDataUrl(f: File): Promise<string> {
  return new Promise((ok, falhou) => {
    const leitor = new FileReader();
    leitor.onerror = () => falhou(new Error('leitura'));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => falhou(new Error('imagem'));
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 320;
        const ctx = c.getContext('2d');
        if (!ctx) return falhou(new Error('canvas'));
        ctx.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 320, 320);
        ok(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(leitor.result || '');
    };
    leitor.readAsDataURL(f);
  });
}

export async function setElevaProfile(uid: string, p: ElevaProfile): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, 'elevaUsers', uid),
      {
        role: p.role,
        roles: p.roles || [p.role],
        name: p.name || '',
        segment: p.segment || '',
        affiliateType: p.affiliateType || '',
        brands: p.brands || [],
        whatsapp: p.whatsapp || '',
        foto: p.foto || '',
        // CARGO E LOJA SÓ ENTRAM QUANDO TÊM VALOR.
        //
        // A `loja` simplesmente não estava aqui. O cadastro pergunta a unidade,
        // o botão de criar conta fica travado até a pessoa escolher — e o
        // gravador jogava a resposta fora. Quinze contas da Ramasa ficaram sem
        // loja assim, três delas DEPOIS de eu travar o campo, e ninguém podia
        // perceber: a tela mostrava a unidade escolhida até o fim.
        //
        // E entram só quando têm valor porque `cargo: p.cargo || ''` é o mesmo
        // defeito pelo avesso — com merge: true, gravar vazio APAGA o que já
        // estava lá. Campo em branco não é uma resposta; é a ausência dela, e
        // ausência não deve escrever nada por cima.
        ...(p.cargo ? { cargo: p.cargo } : {}),
        ...(p.loja ? { loja: p.loja } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    /* offline / sem permissão: o localStorage cobre neste aparelho */
  }
}

/**
 * O cargo da pessoa, corrigido depois do cadastro.
 *
 * Existe porque até aqui não existia: quem entrasse sem cargo — por uma conta
 * antiga, por um furo do cadastro ou por ter entrado na aba "Entrar" sem nunca
 * ter criado perfil — não tinha NENHUMA tela no app capaz de consertar isso. E
 * sem cargo a gerência olha as respostas do time e não sabe quem falou.
 */
export async function updateElevaCargo(uid: string, cargo: string): Promise<void> {
  if (!db || !cargo) return;
  try {
    await setDoc(doc(db, 'elevaUsers', uid), { cargo, updatedAt: serverTimestamp() }, { merge: true });
  } catch { /* offline / sem permissão */ }
}

/**
 * A loja da pessoa. Guardada na CONTA porque é ela que separa o time no painel
 * e preenche a Jornada sem o vendedor digitar a própria unidade toda vez.
 */
export async function updateElevaLoja(uid: string, loja: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'elevaUsers', uid), { loja, updatedAt: serverTimestamp() }, { merge: true });
  } catch { /* offline / sem permissão */ }
}
