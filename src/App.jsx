import React, { useEffect, useMemo, useState } from 'react'
import { categories, tools } from './data/tools'

const STORAGE = {
  favorites: 'findapp:favorites',
  recent: 'findapp:recent',
}

const SMU_LINKS = [
  { name: '샘물포털', short: '포털', description: '통합정보·웹메일·학사서비스', url: 'https://portal.smu.ac.kr', icon: 'S' },
  { name: 'e-Campus', short: '이캠퍼스', description: '강의·과제·온라인 학습', url: 'https://ecampus.smu.ac.kr/', icon: 'e' },
  { name: '수강신청', short: '수강신청', description: '수강신청·정정 시스템', url: 'https://sugang.smu.ac.kr/', icon: '수' },
  { name: 'SM-EDU', short: 'SM-EDU', description: '학사 통합 대시보드·AI 학사안내', url: 'https://smedu.smu.ac.kr/', icon: 'AI' },
  { name: '스마트출결', short: '출결', description: '모바일 출석·출결 현황', url: 'https://att.smu.ac.kr/', icon: '✓' },
  { name: '통합공지', short: '공지', description: '학사·장학·학생생활 공지', url: 'https://www.smu.ac.kr/lounge/notice/notice.do', icon: '!' },
  { name: '학사일정', short: '학사일정', description: '개강·시험·종강 일정', url: 'https://www.smu.ac.kr/ko/life/academicCalendar.do', icon: '日' },
  { name: '상명대학교', short: '학교홈', description: '상명대학교 공식 홈페이지', url: 'https://www.smu.ac.kr/ko/index.do', icon: 'SM' },
]

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
            다른 도구 보기
          </button>
        )}
      </div>

      <button className="pick-body" onClick={() => onOpen(tool)}>
        <Favicon tool={tool} large />
        <div>
          <h3>{tool.name}</h3>
          <p>{tool.description}</p>
          <span className="pick-link">사이트 열기 ↗</span>
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
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installHelp, setInstallHelp] = useState(false)
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true,
  )

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setInstallHelp(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

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

  const searchAllTools = (value) => {
    setQuery(value)
    if (value.trim()) {
      setCategory('전체')
      setFavoritesOnly(false)
    }
  }

  const selectCategory = (item) => {
    setCategory(item)
    setFavoritesOnly(false)
  }

  const showFavorites = () => {
    setFavoritesOnly(true)
    setCategory('전체')
    window.setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const handleInstall = async () => {
    if (isInstalled) return

    if (installPrompt) {
      installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    setInstallHelp(true)
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          <div className="mobile-header-actions">
            {!isInstalled && (
              <button className="mobile-install" onClick={handleInstall}>
                설치
              </button>
            )}
            <button className="mobile-favorite" onClick={showFavorites}>
              ★ {favorites.length}
            </button>
          </div>
        </header>

        <section className="top-section" id="home">
          <div className="top-meta">
            <div>
              <p className="eyebrow">DISCOVER BETTER TOOLS</p>
              <h1>무엇을 찾고 계신가요?</h1>
              <p className="intro">
                필요한 작업을 검색하시면 바로 사용할 수 있는 사이트와 앱을 찾아드립니다
              </p>
            </div>
            <div className="top-actions">
              {!isInstalled && (
                <button className="install-button" onClick={handleInstall}>
                  <span>＋</span>
                  FINDAPP 설치
                </button>
              )}
              <div className="tool-counter">
                <strong>{tools.length}</strong>
                <span>TOOLS</span>
              </div>
            </div>
          </div>

          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => searchAllTools(event.target.value)}
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
              <button key={item} onClick={() => searchAllTools(item)}>
                {item}
              </button>
            ))}
          </div>

          <section className="smu-quick" id="smu-links">
            <div className="smu-heading">
              <div>
                <p>SMU QUICK LINKS</p>
                <h2>상명대 바로가기</h2>
              </div>
              <span>자주 사용하는 학교 서비스를 빠르게 열어보세요</span>
            </div>
            <div className="smu-link-grid">
              {SMU_LINKS.map((link) => (
                <a key={link.name} className="smu-link" href={link.url} target="_blank" rel="noopener noreferrer">
                  <span className="smu-link-icon">{link.icon}</span>
                  <span className="smu-link-copy">
                    <strong>{link.name}</strong>
                    <small>{link.description}</small>
                  </span>
                  <span className="smu-link-arrow">↗</span>
                </a>
              ))}
            </div>
          </section>

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

          <section className="results-section" id="results">
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
                <h3>조건에 맞는 도구가 없습니다</h3>
                <p>검색어나 필터를 변경하시면 더 많은 결과를 확인하실 수 있습니다</p>
                <button onClick={resetFilters}>전체 도구 보기</button>
              </div>
            )}
          </section>

          <footer>
            <div>
              <strong>FINDAPP</strong>
              <span>필요한 도구를 가장 간단하게 찾아보세요</span>
            </div>
            <p>서비스 요금과 가입 조건은 각 사이트의 최신 안내를 확인해 주세요</p>
          </footer>
        </section>
        {installHelp && (
          <div className="install-sheet-backdrop" onClick={() => setInstallHelp(false)}>
            <section className="install-sheet" onClick={(event) => event.stopPropagation()}>
              <button className="install-sheet-close" onClick={() => setInstallHelp(false)} aria-label="닫기">×</button>
              <p className="eyebrow">PWA INSTALL</p>
              <h2>FINDAPP을 앱처럼 설치해 보세요</h2>
              <div className="install-guide">
                <div>
                  <strong>iPhone / iPad</strong>
                  <span>Safari 하단의 공유 버튼을 누른 뒤 <b>홈 화면에 추가</b>를 선택해 주세요</span>
                </div>
                <div>
                  <strong>Android / Chrome</strong>
                  <span>브라우저 메뉴에서 <b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 선택해 주세요</span>
                </div>
                <div>
                  <strong>PC Chrome / Edge</strong>
                  <span>주소창 오른쪽의 설치 아이콘을 눌러 설치하실 수 있습니다</span>
                </div>
              </div>
              <button className="install-sheet-done" onClick={() => setInstallHelp(false)}>확인</button>
            </section>
          </div>
        )}

        <nav className="mobile-bottom-nav" aria-label="모바일 메뉴">
          <button onClick={() => scrollTo('home')}><span>⌂</span><small>홈</small></button>
          <button onClick={() => scrollTo('smu-links')}><span>SM</span><small>상명대</small></button>
          <button onClick={() => scrollTo('results')}><span>⌕</span><small>도구</small></button>
          <button onClick={showFavorites}><span>★</span><small>즐겨찾기</small></button>
          {!isInstalled && <button onClick={handleInstall}><span>＋</span><small>설치</small></button>}
        </nav>
      </main>
    </div>
  )
}

export default App
