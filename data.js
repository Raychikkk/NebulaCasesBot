const RARITY = {
  common:    { name: 'Обычный',     color: '#8a94a6', glow: 'rgba(138,148,166,0.5)' },
  rare:      { name: 'Редкий',      color: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },
  epic:      { name: 'Эпический',   color: '#a855f7', glow: 'rgba(168,85,247,0.6)' },
  legendary: { name: 'Легендарный', color: '#f59e0b', glow: 'rgba(245,158,11,0.7)' },
};

// ВАЖНО: тут пути к файлам.
// Если у тебя файлы называются иначе — просто поменяй имя после assets/
// Например: lottie: 'assets/AnimatedSticker (3).tgs'
const ITEMS = {
  star:    { emoji: '⭐', name: 'Звезда',    rarity: 'common',    lottie: 'assets/star.tgs' },
  heart:   { emoji: '❤️', name: 'Сердце',    rarity: 'common',    lottie: 'assets/heart.tgs' },
  cake:    { emoji: '🎂', name: 'Тортик',    rarity: 'common',    lottie: 'assets/cake.tgs' },
  rose:    { emoji: '🌹', name: 'Роза',      rarity: 'common',    lottie: 'assets/rose.tgs' },
  rocket:  { emoji: '🚀', name: 'Ракета',    rarity: 'rare',      lottie: 'assets/rocket.tgs' },
  diamond: { emoji: '💎', name: 'Алмаз',     rarity: 'rare',      lottie: 'assets/diamond.tgs' },
  trophy:  { emoji: '🏆', name: 'Кубок',     rarity: 'rare',      lottie: 'assets/trophy.tgs' },
  crown:   { emoji: '👑', name: 'Корона',    rarity: 'epic',      lottie: 'assets/crown.tgs' },
  ring:    { emoji: '💍', name: 'Кольцо',    rarity: 'epic',      lottie: 'assets/ring.tgs' },
  bear:    { emoji: '🧸', name: 'Мишка',     rarity: 'legendary', lottie: 'assets/bear.tgs' },
  unicorn: { emoji: '🦄', name: 'Единорог',  rarity: 'legendary', lottie: 'assets/unicorn.tgs' },
};

const CASES = [
  {
    id: 'starter',
    title: 'Стартовый',
    price: 50,
    emoji: '📦',
    gradient: 'linear-gradient(135deg,#3b82f6,#1e40af)',
    pool: [
      { item: 'star',    weight: 40 },
      { item: 'heart',   weight: 30 },
      { item: 'cake',    weight: 15 },
      { item: 'rose',    weight: 10 },
      { item: 'rocket',  weight: 3  },
      { item: 'diamond', weight: 1.5},
      { item: 'crown',   weight: 0.4},
      { item: 'bear',    weight: 0.1},
    ],
  },
  {
    id: 'premium',
    title: 'Премиум',
    price: 250,
    emoji: '💠',
    gradient: 'linear-gradient(135deg,#a855f7,#6d28d9)',
    pool: [
      { item: 'heart',   weight: 25 },
      { item: 'cake',    weight: 20 },
      { item: 'rose',    weight: 15 },
      { item: 'rocket',  weight: 15 },
      { item: 'diamond', weight: 12 },
      { item: 'trophy',  weight: 8  },
      { item: 'crown',   weight: 3  },
      { item: 'ring',    weight: 1.5},
      { item: 'bear',    weight: 0.4},
      { item: 'unicorn', weight: 0.1},
    ],
  },
  {
    id: 'legend',
    title: 'Легенда',
    price: 1000,
    emoji: '🔥',
    gradient: 'linear-gradient(135deg,#f59e0b,#b45309)',
    pool: [
      { item: 'rocket',  weight: 30 },
      { item: 'diamond', weight: 25 },
      { item: 'trophy',  weight: 20 },
      { item: 'crown',   weight: 12 },
      { item: 'ring',    weight: 8  },
      { item: 'bear',    weight: 3  },
      { item: 'unicorn', weight: 2  },
    ],
  },
];