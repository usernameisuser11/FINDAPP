import React, { useMemo, useState } from 'react'
import { categories, tools } from './data/tools'

const STORAGE = {
  favorites: 'findapp:favorites',
  recent: 'findapp:recent',
}

const CATEGORY_ICON = {
  전체: '⌕',
  공부: '◫',
  AI: '✦',
  디자인: '◇',
  개발: '<>',
  문서: '▤',
  취업: '◎',
  대학생활: '◉',
  기타: '•••',
}

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function Favicon({ tool, large = false }) {
  const domain = getDomain(tool.url)
  const size = large ? 64 : 40

  return (
    <div className={large ? 'favicon large' : 'favicon'} aria-hidden="true">
      <span>{tool.name.slice(0, 1).toUpperCase()}</span>
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`}
        alt=""
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}

function ToolRow({ tool, favorite, onFavorite, onOpen }) {
  const domain = getDomain(tool.url)

  return (
    <article className="tool-row">
      <button className="tool-open-area" onClick={() => onOpen(tool)}>
        <Favicon tool={tool} />

        <div className="tool-main">
          <div className="tool-title-line">
            <h3>{tool.name}</h3>
            <span className="tool-domain">{domain}</span>
          </div>
          <p>{tool.description}</p>
          <div className="tool-tags">
            <span className="category-tag">{tool.category}</span>
            {tool.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </button>

      <div className="tool-side">
        <div className="tool-badges">
          {tool.cost.includes('무료') && <span>FREE</span>}
          {tool.noSignup && <span>NO SIGNUP</span>}
          {tool.korean && <span>KR</span>}
        </div>
        <div className="tool-actions">
          <button
            className={favorite ? 'icon-button star active' : 'icon-button star'}
            onClick={() => onFavorite(tool.id)}
            aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            title={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            {favorite ? '★' : '☆'}
          </button>
          <button
            className="icon-button arrow"
            onClick={() => onOpen(tool)}
            aria-label={`${tool.name} 열기`}
            title="사이트 열기"
          >
            ↗
          </button>
        </div>
      </div>
    </article>
  )
}

function PickCard({ label, tool, onOpen, onShuffle, accent = false }) {
  return (
    <article className={accent ? 'pick-card accent' : 'pick-card'}>
      <div className="pick-top">
        <span className="pick-label">{label}</span>
        {onShuffle && (
          <button className="mini-button" onClick={onShuffle}>
            다시 뽑기
          </button>
        )}
      </div>

      <button className="pick-body" onClick={() => onOpen(tool)}>
        <Favicon tool={tool} large />
        <div>
          <h3>{tool.name}</h3>
          <p>{tool.description}</p>
          <span className="pick-link">바로 열기 ↗</span>
        </div>
      </button>
    </article>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [freeOnly, setFreeOnly] = useState(false)
  const [noSignupOnly, setNoSignupOnly] = useState(false)
  const [koreanOnly, setKoreanOnly] = useState(false)
  const [aiOnly, setAiOnly] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState(() => loadJson(STORAGE.favorites, []))
  const [recent, setRecent] = useState(() => loadJson(STORAGE.recent, []))
  const [randomId, setRandomId] = useState(null)

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return tools.filter((tool) => {
      const text = [
        tool.name,
        tool.description,
        tool.category,
        tool.cost,
        ...tool.tags,
      ]
        .join(' ')
        .toLowerCase()

      if (keyword && !text.includes(keyword)) return false
      if (category !== '전체' && tool.category !== category) return false
      if (freeOnly && !tool.cost.includes('무료')) return false
      if (noSignupOnly && !tool.noSignup) return false
      if (koreanOnly && !tool.korean) return false
      if (aiOnly && !tool.ai) return false
      if (favoritesOnly && !favorites.includes(tool.id)) return false
      return true
    })
  }, [
    query,
    category,
    freeOnly,
    noSignupOnly,
    koreanOnly,
    aiOnly,
    favoritesOnly,
    favorites,
  ])

  const dailyPick = useMemo(() => {
    const today = new Date()
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate()

    return tools[seed % tools.length]
  }, [])

  const randomTool = randomId
    ? tools.find((tool) => tool.id === randomId) || dailyPick
    : tools[(tools.indexOf(dailyPick) + 17) % tools.length]

  const recentTools = recent
    .map((id) => tools.find((tool) => tool.id === id))
    .filter(Boolean)
    .slice(0, 6)

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current]

      localStorage.setItem(STORAGE.favorites, JSON.stringify(next))
      return next
    })
  }

  const openTool = (tool) => {
    const next = [tool.id, ...recent.filter((id) => id !== tool.id)].slice(0, 8)
    setRecent(next)
    localStorage.setItem(STORAGE.recent, JSON.stringify(next))
    window.open(tool.url, '_blank', 'noopener,noreferrer')
  }

  const pickRandom = () => {
    const pool = filtered.length ? filtered : tools
    const selected = pool[Math.floor(Math.random() * pool.length)]
    setRandomId(selected.id)
  }

  const resetFilters = () => {
    setQuery('')
    setCategory('전체')
    setFreeOnly(false)
    setNoSignupOnly(false)
    setKoreanOnly(false)
    setAiOnly(false)
    setFavoritesOnly(false)
  }

  const selectCategory = (item) => {
    setCategory(item)
    setFavoritesOnly(false)
  }

  const showFavorites = () => {
    setFavoritesOnly(true)
    setCategory('전체')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="FINDAPP 홈">
          <span className="brand-mark">F</span>
          <span className="brand-copy">
            <strong>FINDAPP</strong>
            <small>tool directory</small>
          </span>
        </a>

        <nav className="side-nav" aria-label="도구 카테고리">
          <p className="nav-label">DISCOVER</p>
          {categories.map((item) => (
            <button
              key={item}
              className={!favoritesOnly && category === item ? 'side-item active' : 'side-item'}
              onClick={() => selectCategory(item)}
            >
              <span className="side-icon">{CATEGORY_ICON[item]}</span>
              <span>{item}</span>
              <small>
                {item === '전체'
                  ? tools.length
                  : tools.filter((tool) => tool.category === item).length}
              </small>
            </button>
          ))}

          <p className="nav-label library-label">LIBRARY</p>
          <button
            className={favoritesOnly ? 'side-item active' : 'side-item'}
            onClick={showFavorites}
          >
            <span className="side-icon">★</span>
            <span>즐겨찾기</span>
            <small>{favorites.length}</small>
          </button>

          <button
            className="side-item"
            onClick={() => {
              document.getElementById('recent')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span className="side-icon">◷</span>
            <span>최근 본 도구</span>
            <small>{recentTools.length}</small>
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="status-dot" />
          <span>{tools.length} tools available</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="mobile-header">
          <a className="brand mobile-brand" href="/">
            <span className="brand-mark">F</span>
            <strong>FINDAPP</strong>
          </a>
          <button className="mobile-favorite" onClick={showFavorites}>
            ★ {favorites.length}
          </button>
        </header>

        <section className="top-section">
          <div className="top-meta">
            <div>
              <p className="eyebrow">DISCOVER BETTER TOOLS</p>
              <h1>뭘 찾고 있어?</h1>
              <p className="intro">
                필요한 작업을 검색하면 바로 쓸 수 있는 사이트와 앱을 찾아줄게
              </p>
            </div>
            <div className="tool-counter">
              <strong>{tools.length}</strong>
              <span>TOOLS</span>
            </div>
          </div>

          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="PDF 합치기, 논문 찾기, 무료 이미지, 코딩 오류..."
              autoFocus
            />
            <kbd>⌘ K</kbd>
            {query && (
              <button onClick={() => setQuery('')} aria-label="검색어 지우기">
                ×
              </button>
            )}
          </label>

          <div className="quick-searches">
            <span>Quick search</span>
            {['PDF', '논문', '무료 이미지', 'PPT', '코딩', '취업'].map((item) => (
              <button key={item} onClick={() => setQuery(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="mobile-categories">
            {categories.map((item) => (
              <button
                key={item}
                className={!favoritesOnly && category === item ? 'active' : ''}
                onClick={() => selectCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="workspace">
          <div className="filters">
            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(event) => setFreeOnly(event.target.checked)}
                />
                <span>무료</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={noSignupOnly}
                  onChange={(event) => setNoSignupOnly(event.target.checked)}
                />
                <span>가입 없이</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={koreanOnly}
                  onChange={(event) => setKoreanOnly(event.target.checked)}
                />
                <span>한국어</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={aiOnly}
                  onChange={(event) => setAiOnly(event.target.checked)}
                />
                <span>AI</span>
              </label>
            </div>

            <button className="clear-filters" onClick={resetFilters}>
              필터 초기화
            </button>
          </div>

          <section className="picks">
            <PickCard
              label="TODAY'S PICK"
              tool={dailyPick}
              onOpen={openTool}
              accent
            />
            <PickCard
              label="RANDOM FIND"
              tool={randomTool}
              onOpen={openTool}
              onShuffle={pickRandom}
            />
          </section>

          {recentTools.length > 0 && (
            <section className="recent-section" id="recent">
              <div className="section-heading">
                <div>
                  <p>RECENT</p>
                  <h2>최근 본 도구</h2>
                </div>
              </div>

              <div className="recent-list">
                {recentTools.map((tool) => (
                  <button key={tool.id} onClick={() => openTool(tool)}>
                    <Favicon tool={tool} />
                    <span>
                      <strong>{tool.name}</strong>
                      <small>{tool.category}</small>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="results-section">
            <div className="section-heading result-heading">
              <div>
                <p>EXPLORE</p>
                <h2>
                  {favoritesOnly
                    ? '즐겨찾기'
                    : category === '전체'
                      ? '모든 도구'
                      : category}
                </h2>
              </div>
              <span>{filtered.length} results</span>
            </div>

            {filtered.length > 0 ? (
              <div className="tool-list">
                {filtered.map((tool) => (
                  <ToolRow
                    key={tool.id}
                    tool={tool}
                    favorite={favorites.includes(tool.id)}
                    onFavorite={toggleFavorite}
                    onOpen={openTool}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span>⌕</span>
                <h3>조건에 맞는 도구가 없어</h3>
                <p>검색어나 필터를 바꾸면 더 많은 결과를 볼 수 있어</p>
                <button onClick={resetFilters}>전체 도구 보기</button>
              </div>
            )}
          </section>

          <footer>
            <div>
              <strong>FINDAPP</strong>
              <span>필요한 도구를 찾는 가장 단순한 방법</span>
            </div>
            <p>서비스 요금과 가입 조건은 실제 사이트의 최신 안내를 확인해줘</p>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
