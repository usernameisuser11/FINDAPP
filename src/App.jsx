import React, { useMemo, useState } from 'react'
import { categories, tools } from './data/tools'

const STORAGE = {
  favorites: 'findapp:favorites',
  recent: 'findapp:recent',
}

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function ToolCard({ tool, favorite, onFavorite, onOpen }) {
  const domain = new URL(tool.url).hostname.replace('www.', '')

  return (
    <article className="tool-card">
      <div className="tool-card__top">
        <div className="tool-icon" aria-hidden="true">
          {tool.name.slice(0, 1).toUpperCase()}
        </div>
        <button
          className={favorite ? 'star-button active' : 'star-button'}
          onClick={() => onFavorite(tool.id)}
          aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          title={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="tool-card__heading">
        <p className="tool-category">{tool.category}</p>
        <h3>{tool.name}</h3>
        <p className="tool-domain">{domain}</p>
      </div>

      <p className="tool-description">{tool.description}</p>

      <div className="tag-row">
        {tool.tags.slice(0, 4).map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>

      <div className="tool-meta">
        <span>{tool.cost}</span>
        {tool.noSignup && <span>가입 없이 사용</span>}
        {tool.korean && <span>한국어</span>}
      </div>

      <button className="open-button" onClick={() => onOpen(tool)}>
        사이트 열기
        <span aria-hidden="true">↗</span>
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
    ? tools.find((tool) => tool.id === randomId)
    : dailyPick

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

  return (
    <main>
      <header className="hero">
        <nav className="nav">
          <a className="brand" href="/" aria-label="FINDAPP 홈">
            <span className="brand-mark">F</span>
            <span>FINDAPP</span>
          </a>
          <button
            className={favoritesOnly ? 'favorite-nav active' : 'favorite-nav'}
            onClick={() => setFavoritesOnly((value) => !value)}
          >
            ★ 즐겨찾기 {favorites.length}
          </button>
        </nav>

        <div className="hero-content">
          <div className="eyebrow">대학생을 위한 도구 탐색 허브</div>
          <h1>
            필요한 건 있는데
            <br />
            <span>어디서 해야 할지 모를 때</span>
          </h1>
          <p>
            하고 싶은 일을 검색해봐. 공부부터 PDF, 디자인, AI, 코딩,
            취업까지 바로 쓸 수 있는 도구를 찾아줄게.
          </p>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: PDF 합치기, 무료 이미지, 논문 찾기, 코딩 오류..."
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="검색어 지우기">
                ×
              </button>
            )}
          </label>

          <div className="popular-searches">
            <span>빠른 검색</span>
            {['PDF', '논문', '무료 이미지', 'PPT', '코딩', '취업'].map((item) => (
              <button key={item} onClick={() => setQuery(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="content">
        <div className="category-strip" aria-label="카테고리">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'category-button active' : 'category-button'}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <label>
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(event) => setFreeOnly(event.target.checked)}
            />
            <span>무료 사용 가능</span>
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
            <span>AI 도구</span>
          </label>

          <button className="reset-button" onClick={resetFilters}>
            초기화
          </button>
        </div>

        <section className="discovery-card">
          <div>
            <p className="discovery-label">오늘 하나 건져가</p>
            <h2>{randomTool.name}</h2>
            <p>{randomTool.description}</p>
            <div className="tag-row">
              {randomTool.tags.slice(0, 4).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </div>
          <div className="discovery-actions">
            <button className="ghost-button" onClick={pickRandom}>
              🎲 다른 거
            </button>
            <button className="primary-button" onClick={() => openTool(randomTool)}>
              바로 가기 ↗
            </button>
          </div>
        </section>

        {recentTools.length > 0 && (
          <section className="recent-section">
            <div className="section-title">
              <div>
                <p className="section-kicker">RECENT</p>
                <h2>최근 본 도구</h2>
              </div>
            </div>
            <div className="recent-row">
              {recentTools.map((tool) => (
                <button key={tool.id} onClick={() => openTool(tool)}>
                  <strong>{tool.name}</strong>
                  <span>{tool.category}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="results-section">
          <div className="section-title">
            <div>
              <p className="section-kicker">EXPLORE</p>
              <h2>
                {favoritesOnly ? '즐겨찾기' : category === '전체' ? '모든 도구' : category}
              </h2>
            </div>
            <p className="result-count">{filtered.length}개 찾음</p>
          </div>

          {filtered.length > 0 ? (
            <div className="tool-grid">
              {filtered.map((tool) => (
                <ToolCard
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
              <div>⌕</div>
              <h3>조건에 맞는 도구가 아직 없어</h3>
              <p>검색어나 필터를 조금 바꿔보거나 전체 목록으로 돌아가봐.</p>
              <button className="primary-button" onClick={resetFilters}>
                전체 도구 보기
              </button>
            </div>
          )}
        </section>
      </section>

      <footer>
        <div>
          <strong>FINDAPP</strong>
          <span>필요한 도구를 찾는 가장 단순한 방법</span>
        </div>
        <p>
          요금제와 가입 조건은 서비스 정책에 따라 바뀔 수 있어. 실제 사용 전 각
          사이트의 최신 안내를 확인해줘.
        </p>
      </footer>
    </main>
  )
}

export default App
