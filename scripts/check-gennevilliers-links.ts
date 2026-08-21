import { GENNEVILLIERS_DOCUTHEQUE } from '../src/data/gennevilliersDocutheque.ts';

async function checkUrl(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);

    // If HEAD fails or gives 405 Method Not Allowed, try GET with range header
    if (response.status === 405 || response.status === 403) {
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 7000);
      const getResponse = await fetch(url, {
        method: 'GET',
        signal: getController.signal,
        headers: {
          'Range': 'bytes=0-100',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(getTimeoutId);
      return { status: getResponse.status, ok: getResponse.ok, statusText: getResponse.statusText };
    }

    return { status: response.status, ok: response.ok, statusText: response.statusText };
  } catch (err: any) {
    return { status: 0, ok: false, statusText: err.name === 'AbortError' ? 'TIMEOUT (7s)' : err.message };
  }
}

async function main() {
  console.log(`🔍 Vérification des ${GENNEVILLIERS_DOCUTHEQUE.length} liens de la Docuthèque Gennevilliers...\n`);

  const results: Array<{ id: string; title: string; url: string; status: number; ok: boolean; error?: string }> = [];

  // Batch checking with concurrency limit of 5 to not flood
  const concurrency = 5;
  for (let i = 0; i < GENNEVILLIERS_DOCUTHEQUE.length; i += concurrency) {
    const chunk = GENNEVILLIERS_DOCUTHEQUE.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(async (doc) => {
        const res = await checkUrl(doc.url);
        return {
          id: doc.id,
          title: doc.title,
          url: doc.url,
          status: res.status,
          ok: res.ok,
          error: res.ok ? undefined : `${res.status} ${res.statusText}`
        };
      })
    );
    results.push(...chunkResults);
    process.stdout.write(`... vérifié ${Math.min(i + concurrency, GENNEVILLIERS_DOCUTHEQUE.length)} / ${GENNEVILLIERS_DOCUTHEQUE.length}\r`);
  }

  console.log('\n');

  const okLinks = results.filter(r => r.ok || (r.status >= 200 && r.status < 400));
  const error410 = results.filter(r => r.status === 410);
  const error404 = results.filter(r => r.status === 404);
  const error403 = results.filter(r => r.status === 403);
  const unreachable = results.filter(r => r.status === 0);
  const otherErrors = results.filter(r => !r.ok && ![410, 404, 403, 0].includes(r.status));

  console.log(`========================================`);
  console.log(`📊 BILAN DU CONTRÔLE DES LIENS GENNEVILLIERS`);
  console.log(`========================================`);
  console.log(`✅ Liens fonctionnels (200/30x) : ${okLinks.length}`);
  console.log(`❌ Erreurs 410 (Gone)           : ${error410.length}`);
  console.log(`❌ Erreurs 404 (Introuvable)    : ${error404.length}`);
  console.log(`🔒 Erreurs 403 (Accès Restreint): ${error403.length}`);
  console.log(`⚠️  Injoignables / Timeouts      : ${unreachable.length}`);
  console.log(`⚠️  Autres erreurs               : ${otherErrors.length}`);
  console.log(`----------------------------------------`);

  if (error410.length > 0) {
    console.log(`\n❌ DÉTAIL DES LIENS 410 (Ressource supprimée) :`);
    error410.forEach(e => console.log(` - [${e.id}] ${e.title}\n   ${e.url}`));
  }

  if (error404.length > 0) {
    console.log(`\n❌ DÉTAIL DES LIENS 404 (Fichier non trouvé) :`);
    error404.forEach(e => console.log(` - [${e.id}] ${e.title}\n   ${e.url}`));
  }

  if (error403.length > 0) {
    console.log(`\n🔒 DÉTAIL DES LIENS 403 (Accès Restreint Intranet/VPN) :`);
    error403.forEach(e => console.log(` - [${e.id}] ${e.title}\n   ${e.url}`));
  }

  if (unreachable.length > 0) {
    console.log(`\n⚠️ DÉTAIL DES LIENS INJOIGNABLES :`);
    unreachable.slice(0, 10).forEach(e => console.log(` - [${e.id}] ${e.title}\n   ${e.url}\n   Erreur: ${e.error}`));
  }

  if (okLinks.length > 0) {
    console.log(`\n✅ EXEMPLES DE LIENS QUI FONCTIONNENT :`);
    okLinks.slice(0, 5).forEach(e => console.log(` - [${e.id}] ${e.title} (${e.status})\n   ${e.url}`));
  }
}

main().catch(console.error);
