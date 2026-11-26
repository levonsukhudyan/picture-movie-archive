import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Film, Image, Search, X, LoaderCircle, Sparkles, ChevronRight } from 'lucide-react';

const MOVIE_API = 'https://yts.mx/api/v2';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const starters = ['Perfect Days', 'Past Lives', 'The Grand Budapest Hotel'];

function useHashRoute() {
  const [route, setRoute] = useState(() => location.hash.replace('#/', '') || 'home');
  useEffect(() => {
    const update = () => setRoute(location.hash.replace('#/', '') || 'home');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}

function App() {
  const route = useHashRoute();
  const [mode, setMode] = useState('movies');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelected(null); setItems([]); setQuery(''); setSubmitted(''); setError(''); setPage(1);
    if (route === 'movies' || route === 'pictures') setMode(route);
  }, [route]);

  useEffect(() => {
    if (!selected || mode !== 'movies' || selected.description_full || selected.cast) return;
    const controller = new AbortController();
    async function loadMovie() {
      setLoading(true); setError('');
      try {
        const response = await fetch(`${MOVIE_API}/movie_details.json?movie_id=${selected.id}&with_images=true&with_cast=true`, { signal: controller.signal });
        const json = await response.json();
        if (json.status !== 'ok') throw new Error('Could not load this film.');
        setSelected(current => current?.id === selected.id ? { ...current, ...json.data.movie } : current);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Could not load this film.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    loadMovie();
    return () => controller.abort();
  }, [selected?.id, mode]);

  useEffect(() => {
    if (!submitted || (mode === 'movies' && selected)) return;
    const controller = new AbortController();
    async function search() {
      setLoading(true); setError('');
      try {
        if (mode === 'movies') {
          const url = new URL(`${MOVIE_API}/list_movies.json`);
          url.searchParams.set('query_term', submitted);
          url.searchParams.set('limit', '20');
          url.searchParams.set('page', String(page));
          url.searchParams.set('sort_by', 'download_count');
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error('The movie archive could not be reached. Please try again.');
          const json = await response.json();
          if (json.status !== 'ok') throw new Error(json.status_message || 'Movie search failed.');
          setItems(json.data.movies || []);
        } else {
          const url = new URL(COMMONS_API);
          url.search = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: submitted, gsrnamespace: '6', gsrlimit: '24', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '680', format: 'json', origin: '*' });
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error('The photo archive could not be reached. Please try again.');
          const json = await response.json();
          setItems(Object.values(json.query?.pages || {}).filter(x => x.imageinfo?.[0]?.thumburl));
        }
      } catch (e) {
        if (e.name !== 'AbortError') { setError(e.message || 'Something went wrong. Try again in a moment.'); setItems([]); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    search();
    return () => controller.abort();
  }, [submitted, mode, page]);

  function openItem(item) { setError(''); setSelected(item); }

  function submitSearch(e) { e?.preventDefault(); if (!query.trim()) return; setSelected(null); setPage(1); setSubmitted(query.trim()); }
  function setSection(next) { location.hash = `/${next}`; }
  const title = route === 'home' ? 'A LITTLE ARCHIVE\nOF EVERYTHING.' : route === 'pictures' ? 'PICTURES' : 'MOVIES';
  const isHome = route === 'home';

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#/" aria-label="Picture Movie Archive home"><span className="brand-mark"><span /></span><span>PICTURE<span className="brand-divider">/</span>MOVIE<br/><small>PUBLIC ARCHIVE&nbsp; · &nbsp;EST. 2024</small></span></a>
      <nav className="nav" aria-label="Main navigation">
        {[['home','Home'],['movies','Movies'],['pictures','Pictures']].map(([key,label])=><a key={key} className={`nav-link ${route===key?'active':''}`} href={`#/${key}`}>{label}<span className="nav-index">0{key==='home'?1:key==='movies'?2:3}</span></a>)}
      </nav>
      <div className="status"><span className="status-dot"/>ARCHIVE ONLINE</div>
    </header>

    <main>
      {isHome ? <>
        <section className="hero">
          <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/>A FIELD GUIDE TO THE SCREEN & BEYOND</div>
            <h1>A LITTLE ARCHIVE<br/>OF <span className="outlined">EVERYTHING.</span></h1>
            <p className="hero-desc">A place to wander through films worth remembering and images worth keeping. Pick a door and see where it takes you.</p>
            <div className="hero-actions"><button className="button button-primary" onClick={()=>setSection('movies')}><Film size={16}/> EXPLORE FILMS <ArrowUpRight size={15}/></button><button className="button button-quiet" onClick={()=>setSection('pictures')}><Image size={16}/> BROWSE PICTURES <ArrowUpRight size={15}/></button></div>
          </div>
          <div className="hero-art" aria-label="Abstract collage of movie stills"><div className="art-sun"/><div className="art-frame frame-one"><div className="frame-glow"/><span>STILL NO. 018</span></div><div className="art-frame frame-two"><div className="frame-shape"/><span>ARCHIVE / 024</span></div><div className="art-stamp">PM<br/><i>—</i><br/>01</div><div className="art-caption">LIGHT LEAVES<br/>A TRACE <span>↗</span></div></div>
        </section>
        <div className="ticker"><span>FILM IS A MEMORY MACHINE</span><i>✳</i><span>IMAGES ARE HOW WE KEEP IT</span><i>✳</i><span>FILM IS A MEMORY MACHINE</span></div>
        <section className="home-lower"><div><div className="eyebrow">01 / THE COLLECTION</div><h2>Two ways to<br/>get lost.</h2></div><div className="collection-cards"><button className="collection-card film-card" onClick={()=>setSection('movies')}><span className="card-num">01 — MOVING IMAGES</span><Film size={22}/><b>Find your next<br/>favorite film.</b><span className="card-bottom">BROWSE THE FILM ARCHIVE <ArrowUpRight size={16}/></span></button><button className="collection-card photo-card" onClick={()=>setSection('pictures')}><span className="card-num">02 — STILL IMAGES</span><Image size={22}/><b>Follow a picture<br/>somewhere new.</b><span className="card-bottom">WANDER THE PICTURE ARCHIVE <ArrowUpRight size={16}/></span></button></div></section>
      </> : <section className="catalog-page">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>COLLECTION / 0{mode==='movies'?'1':'2'}</div><h1>{selected ? <><span className="heading-back" onClick={()=>setSelected(null)} role="button" tabIndex="0"><ArrowLeft size={19}/> BACK TO {mode.toUpperCase()}</span></> : title}</h1></div><div className="page-note">{mode==='movies'?'A FEW HOURS THAT STAY WITH YOU.':'A MOMENT, FOUND AND KEPT.'}<br/>SEARCH THE OPEN ARCHIVE <span>↘</span></div></div>
        {selected ? <Detail item={selected} mode={mode} onBack={()=>setSelected(null)}/> : <>
          <form className="search-row" onSubmit={submitSearch}><label className="search-box"><Search size={18}/><input aria-label={`Search ${mode}`} placeholder={mode==='movies'?'Search films, directors, a feeling…':'Search photographs, places, ideas…'} value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" className="clear-search" onClick={()=>setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label><button className="button button-primary search-submit" type="submit">SEARCH ARCHIVE <ArrowUpRight size={15}/></button></form>
          <div className="suggestions"><span>TRY:</span>{(mode==='movies'?starters:['film still', 'desert landscape', 'city at night']).map(t=><button key={t} onClick={()=>{setQuery(t);setSelected(null);setPage(1);setSubmitted(t)}}>{t}</button>)}</div>
          {loading && <div className="loading"><LoaderCircle className="spin" size={19}/> CONTACTING THE ARCHIVE…</div>}
          {error && <div className="error-box"><span>!</span><div><b>Couldn’t load the archive.</b><p>{error}</p><button onClick={submitSearch}>TRY AGAIN ↗</button></div></div>}
          {!loading && !error && submitted && <div className="results-head"><div><span className="eyebrow">SEARCH RESULTS</span><h2>“{submitted}”</h2></div><span>{items.length} {items.length===1?'RESULT':'RESULTS'} <span className="result-dot"/></span></div>}
          {!loading && submitted && !error && items.length===0 && <div className="empty-state"><Sparkles size={22}/><h3>Nothing in this frame yet.</h3><p>Try a shorter search or a different subject.</p></div>}
          {!loading && items.length>0 && <div className={`result-grid ${mode==='pictures'?'picture-grid':''}`}>{items.map(item=><ResultCard key={item.id||item.pageid} item={item} mode={mode} onClick={()=>openItem(item)}/>)}</div>}
          {mode==='movies'&&items.length>0&&<div className="pagination"><button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1}><ArrowLeft size={15}/> PREVIOUS</button><span>PAGE <b>{page}</b></span><button onClick={()=>setPage(page+1)}>NEXT <ChevronRight size={15}/></button></div>}
          {!submitted&&!loading&&<div className="browse-hint"><span className="hint-mark">↳</span><p>Type a title, a place, or a half-remembered detail.<br/>The archive will take it from there.</p><span className="hint-code">PM / SEARCH-01</span></div>}
        </>}
      </section>}
    </main>
    <footer className="footer"><a className="footer-brand" href="#/">P/M <span>—</span> A PUBLIC ARCHIVE</a><span>BUILT FOR THE CURIOUS, KEPT BY EVERYONE.</span><span>© 2024—26 &nbsp; <i>↗</i></span></footer>
  </div>;
}

function ResultCard({item,mode,onClick}) {
  const img = mode==='movies' ? item.medium_cover_image || item.large_cover_image : item.imageinfo?.[0]?.thumburl;
  const name = mode==='movies' ? item.title : (item.title||'Untitled photograph').replace(/^File:/,'').replace(/\.[^.]+$/,'').replaceAll('_',' ');
  const sub = mode==='movies' ? `${item.year||'—'}  ·  ★ ${Number(item.rating||0).toFixed(1)}` : 'WIKIMEDIA COMMONS';
  return <button className={`result-card ${mode==='pictures'?'photo-result':''}`} onClick={onClick}>
    <div className="result-image">{img?<img src={img} alt={name} loading="lazy"/>:<div className="poster-placeholder"><Film size={25}/></div>}<span className="result-open"><ArrowUpRight size={16}/></span></div>
    <div className="result-meta"><div><h3>{name}</h3><span>{sub}</span></div><span className="result-arrow">↗</span></div>
  </button>;
}

function Detail({item,mode,onBack}) {
  const [failed,setFailed]=useState(false);
  const movie=mode==='movies';
  const poster=movie?(item.large_cover_image||item.medium_cover_image):item.imageinfo?.[0]?.thumburl;
  const title=movie?item.title:(item.title||'Untitled photograph').replace(/^File:/,'').replace(/\.[^.]+$/,'').replaceAll('_',' ');
  const ext=item.imageinfo?.[0]?.extmetadata||{};
  const description=movie?item.description_full||item.synopsis:item.description||ext.ImageDescription?.value||'A photograph in the Wikimedia Commons public archive.';
  const credits=movie?item.cast?.slice(0,8).map(c=>c.name).join(' · '):ext.Artist?.value?.replace(/<[^>]*>/g,'')||'Wikimedia Commons contributor';
  const rating=movie?Number(item.rating||0).toFixed(1):null;
  return <article className="detail-view"><button className="detail-back" onClick={onBack}><ArrowLeft size={15}/> BACK TO RESULTS</button><div className="detail-content"><div className="detail-poster">{poster&&!failed?<img src={poster} alt={title} onError={()=>setFailed(true)}/>:<div className="poster-placeholder"><Film size={30}/></div>}</div><div className="detail-copy"><div className="eyebrow">{movie?'FEATURED FILM':'ARCHIVE IMAGE'} / {movie?item.year:'PUBLIC DOMAIN ARCHIVE'}</div><h2>{title}</h2><div className="detail-stats">{movie?<><span>★ {rating} / 10</span><span>{item.runtime||'—'} MIN</span><span>{item.language?.toUpperCase()||'FILM'}</span></>:<span>{credits}</span>}</div><p>{description?.replace(/<[^>]*>/g,' ')||'No description is available for this archive item.'}</p>{movie&&item.genres?.length>0&&<div className="genre-list">{item.genres.map(g=><span key={g}>{g}</span>)}</div>}{!movie&&<a className="source-link" href={item.imageinfo?.[0]?.descriptionurl} target="_blank" rel="noreferrer">VIEW SOURCE ON COMMONS <ArrowUpRight size={14}/></a>}<div className="detail-index">ARCHIVE REF. &nbsp; {movie?`YTS-${item.id}`:`WMC-${item.pageid}`}</div></div></div></article>;
}

export default App;
