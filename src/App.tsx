import { useMemo, useState } from 'react'
import './App.css'
import {
  dessertDrinkItems,
  mainCategories,
  nigiriGroups,
  noodleSoupItems,
  sideDishItems,
  type MainCategoryId,
  type MenuItem,
} from './menuData'
import { useResearchLog, type ResearchRecord } from './useResearchLog'
import ResearchPanel from './ResearchPanel'

const baht = (amount: number) => `฿${amount.toLocaleString('th-TH')}`
const pickRandomItemIds = (items: MenuItem[], count: number) => {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ]
  }

  return shuffled.slice(0, count).map((item) => item.id)
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l1.7 9.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L20 7H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H20a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

function App() {
  const [activeMain, setActiveMain] = useState<MainCategoryId>('nigiri')
  const [activeGroup, setActiveGroup] = useState(nigiriGroups[0].id)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [researchOpen, setResearchOpen] = useState(false)
  const [lastResearchRecord, setLastResearchRecord] = useState<ResearchRecord | null>(null)
  const research = useResearchLog()

  const currentGroup =
    nigiriGroups.find((group) => group.id === activeGroup) ?? nigiriGroups[0]

  const allItems = useMemo(
    () => [
      ...nigiriGroups.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          image: item.image ?? group.image,
        })),
      ),
      ...noodleSoupItems,
      ...sideDishItems,
      ...dessertDrinkItems,
    ],
    [],
  )
  const [topItemIds, setTopItemIds] = useState(() =>
    pickRandomItemIds(allItems, 3),
  )
  const [todayItemIds, setTodayItemIds] = useState(() =>
    pickRandomItemIds(allItems, 4),
  )
  const topItems = topItemIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is MenuItem & { image: string } => Boolean(item))
  const todayItems = todayItemIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is MenuItem & { image: string } => Boolean(item))
  const seasonalItems = allItems.filter(
    (item) => item.english === 'Jumbo Scallop',
  )
  const shrimpAndRollItems = allItems.filter((item) =>
    /shrimp|roll/i.test(item.english),
  )

  const selectedItems = allItems.filter((item) => quantities[item.id] > 0)
  const itemCount = selectedItems.reduce(
    (sum, item) => sum + quantities[item.id],
    0,
  )
  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * quantities[item.id],
    0,
  )

  const updateQuantity = (id: string, change: number) => {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + change),
    }))
  }

  const changeMainCategory = (id: MainCategoryId) => {
    setActiveMain(id)
    if (id === 'nigiri') setActiveGroup(nigiriGroups[0].id)
    if (id === 'top') setTopItemIds(pickRandomItemIds(allItems, 3))
    if (id === 'today') setTodayItemIds(pickRandomItemIds(allItems, 4))
  }

  const openCart = () => {
    setConfirmed(false)
    setLastResearchRecord(null)
    setCartOpen(true)
  }

  const handleConfirmOrder = () => {
    const record = research.recordResult(quantities)
    setLastResearchRecord(record)
    setConfirmed(true)
  }

  const renderFoodCard = (item: MenuItem) => {
    const quantity = quantities[item.id] ?? 0

    return (
      <article className="food-card" key={item.id}>
        <img src={item.image ?? currentGroup.image} alt={item.english} />

        <div className="food-details">
          <h2>{item.thai}</h2>
          <p>{item.english}</p>
          <strong>{baht(item.price)}</strong>
        </div>

        <div className="stepper" aria-label={`จำนวน ${item.thai}`}>
          <button
            disabled={!quantity}
            onClick={() => updateQuantity(item.id, -1)}
            aria-label={`ลด ${item.thai}`}
          >
            −
          </button>
          <output>{quantity}</output>
          <button
            onClick={() => updateQuantity(item.id, 1)}
            aria-label={`เพิ่ม ${item.thai}`}
          >
            +
          </button>
        </div>
      </article>
    )
  }

  return (
    <div className="page-shell">
      <main className="phone" aria-label="SUSHI MIZU ordering menu">
        <header className="header">
          <div>
            <p className="brand">SUSHI MIZU</p>
            <p className="subtitle">Japanese Sushi Restaurant</p>
          </div>
          <div className="header-actions">
            <button
              className="research-fab"
              onClick={() => setResearchOpen(true)}
              aria-label="แผงเก็บข้อมูลวิจัย"
            >
              <GearIcon />
            </button>
            <button
              className="cart-icon"
              onClick={openCart}
              aria-label={`ตะกร้า ${itemCount} รายการ`}
            >
              <CartIcon />
              {itemCount > 0 && <span>{itemCount}</span>}
            </button>
          </div>
        </header>

        <nav className="main-tabs" aria-label="หมวดเมนูหลัก">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              className={activeMain === category.id ? 'main-tab active' : 'main-tab'}
              onClick={() => changeMainCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </nav>

        {activeMain === 'nigiri' ? (
          <>
            <nav className="sub-tabs" aria-label="หมวดย่อยนิกิริ">
              {nigiriGroups.map((group) => (
                <button
                  key={group.id}
                  className={activeGroup === group.id ? 'sub-tab active' : 'sub-tab'}
                  onClick={() => setActiveGroup(group.id)}
                >
                  {group.shortLabel}
                </button>
              ))}
            </nav>

            <section className="menu-section" aria-live="polite">
              <div className="section-heading">
                <div>
                  <span className="category-kicker">นิกิริ</span>
                  <h1>{currentGroup.label}</h1>
                  <p>{currentGroup.english}</p>
                </div>
                <span className="item-total">{currentGroup.items.length} รายการ</span>
              </div>

              <div className="menu-list">
                {currentGroup.items.map(renderFoodCard)}
              </div>
            </section>
          </>
        ) : activeMain === 'top' ? (
          <section className="menu-section top-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <span className="category-kicker">TOP</span>
                <h1>เมนูยอดนิยม</h1>
                <p>Popular Picks</p>
              </div>
              <span className="item-total">3 รายการ</span>
            </div>

            <div className="menu-list">{topItems.map(renderFoodCard)}</div>
          </section>
        ) : activeMain === 'seasonal' ? (
          <section className="menu-section top-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <span className="category-kicker">SEASONAL</span>
                <h1>เมนูแนะนำตามช่วงเวลา</h1>
                <p>Seasonal Recommendation</p>
              </div>
              <span className="item-total">1 รายการ</span>
            </div>

            <div className="menu-list">
              {seasonalItems.map(renderFoodCard)}
            </div>
          </section>
        ) : activeMain === 'today' ? (
          <section className="menu-section top-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <span className="category-kicker">TODAY</span>
                <h1>เมนูแนะนำวันนี้</h1>
                <p>Today's Recommendations</p>
              </div>
              <span className="item-total">4 รายการ</span>
            </div>

            <div className="menu-list">{todayItems.map(renderFoodCard)}</div>
          </section>
        ) : activeMain === 'roll' ? (
          <section className="menu-section top-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <span className="category-kicker">SHRIMP &amp; ROLL</span>
                <h1>กุ้ง โรล</h1>
                <p>Shrimp &amp; Roll</p>
              </div>
              <span className="item-total">
                {shrimpAndRollItems.length} รายการ
              </span>
            </div>

            <div className="menu-list">
              {shrimpAndRollItems.map(renderFoodCard)}
            </div>
          </section>
        ) : activeMain === 'noodles' ? (
          <section className="menu-section top-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <span className="category-kicker">NOODLES &amp; SOUP</span>
                <h1>เมนูเส้น ซุป</h1>
                <p>Noodles &amp; Soup</p>
              </div>
              <span className="item-total">
                {noodleSoupItems.length} รายการ
              </span>
            </div>

            <div className="menu-list">
              {noodleSoupItems.map(renderFoodCard)}
            </div>
          </section>
        ) : activeMain === 'sides' ? (
          <section className="menu-section top-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <span className="category-kicker">SIDE DISHES</span>
                <h1>เมนูทานเล่น</h1>
                <p>Side Dishes</p>
              </div>
              <span className="item-total">
                {sideDishItems.length} รายการ
              </span>
            </div>

            <div className="menu-list">
              {sideDishItems.map(renderFoodCard)}
            </div>
          </section>
        ) : activeMain === 'desserts' ? (
          <section className="menu-section top-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <span className="category-kicker">DESSERTS &amp; DRINKS</span>
                <h1>ของหวาน เครื่องดื่ม</h1>
                <p>Desserts &amp; Drinks</p>
              </div>
              <span className="item-total">
                {dessertDrinkItems.length} รายการ
              </span>
            </div>

            <div className="menu-list">
              {dessertDrinkItems.map(renderFoodCard)}
            </div>
          </section>
        ) : (
          <section className="empty-category">
            <span>準備中</span>
            <h1>
              {mainCategories.find((category) => category.id === activeMain)?.label}
            </h1>
            <p>รายการเมนูในหมวดนี้กำลังจัดเตรียม</p>
            <button onClick={() => changeMainCategory('nigiri')}>ดูเมนูนิกิริ</button>
          </section>
        )}

        <button className="sticky-cart" onClick={openCart}>
          <CartIcon />
          <span>Order {itemCount ? `· ${itemCount} items` : ''}</span>
          <b>{baht(total)}</b>
        </button>

        {cartOpen && (
          <div
            className="modal-backdrop"
            role="presentation"
            onMouseDown={() => setCartOpen(false)}
          >
            <section
              className="order-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="sheet-handle" />

              {confirmed ? (
                <div className="confirmed">
                  <div className="check">✓</div>
                  <h2>Order Confirmed</h2>
                  <p>
                    ขอบคุณสำหรับการสั่งอาหาร
                    <br />
                    พนักงานจะนำอาหารมาเสิร์ฟที่โต๊ะของคุณ
                  </p>
                  {lastResearchRecord && (
                    <p className="research-confirm-note">
                      บันทึกผลลัพธ์แล้ว — Error: {lastResearchRecord.totalError}, Decision Time:{' '}
                      {lastResearchRecord.timeSec}s
                    </p>
                  )}
                  <button
                    className="secondary-button"
                    onClick={() => setCartOpen(false)}
                  >
                    กลับสู่เมนู
                  </button>
                </div>
              ) : (
                <>
                  <div className="sheet-heading">
                    <h2 id="order-title">Your Order</h2>
                    <button
                      className="close"
                      onClick={() => setCartOpen(false)}
                      aria-label="ปิด"
                    >
                      ×
                    </button>
                  </div>

                  {selectedItems.length ? (
                    <div className="order-items">
                      {selectedItems.map((item) => (
                        <div className="order-item" key={item.id}>
                          <div>
                            <strong>{item.thai}</strong>
                            <small>
                              {item.english} × {quantities[item.id]}
                            </small>
                          </div>
                          <span>
                            {baht(item.price * quantities[item.id])}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty">ยังไม่ได้เลือกเมนู</p>
                  )}

                  <div className="total">
                    <span>Total</span>
                    <strong>{baht(total)}</strong>
                  </div>
                  <button
                    className="confirm-button"
                    disabled={!selectedItems.length}
                    onClick={handleConfirmOrder}
                  >
                    Confirm Order
                  </button>
                </>
              )}
            </section>
          </div>
        )}
      </main>

      <ResearchPanel api={research} open={researchOpen} onClose={() => setResearchOpen(false)} />
    </div>
  )
}

export default App
