// Demo content for the landing page. None of this is real data yet.

export type Friend = { name: string; craving: string; color: string }
export type Place = { name: string; what: string; price: number; scores: number[] }
export type Pick = { name: string; emoji: string; tint: string; match: number; lines: string[] }
export type Breakdown = { name: string; match: number; bars: number[]; caption: string }

export const friends: Friend[] = [
  { name: 'You', craving: 'anything spicy', color: '#FF5A47' },
  { name: 'Aanya', craving: 'sushi, always', color: '#F59A86' },
  { name: 'Rahul', craving: 'butter chicken (again)', color: '#F08A2E' },
  { name: 'Kabir', craving: 'under ₹300', color: '#3DBE7A' },
  { name: 'Meera', craving: 'pour-over, quiet corner', color: '#C8925F' },
]

// scores line up with `friends` above: how much each person would enjoy the place (0-100)
export const places: Place[] = [
  { name: 'Tokyo Table', what: 'Sushi and ramen', price: 1100, scores: [92, 99, 58, 40, 84] },
  {
    name: 'The Butter Chicken House',
    what: 'Butter chicken and naan',
    price: 450,
    scores: [78, 62, 99, 86, 60],
  },
  { name: 'Momo Republic', what: 'Momos and thukpa', price: 300, scores: [90, 80, 84, 96, 74] },
  {
    name: 'Second Crack Coffee',
    what: 'Pour-over and brunch',
    price: 650,
    scores: [70, 78, 52, 48, 98],
  },
  {
    name: 'Bao & Chilli',
    what: 'Bao, ramen, very hot wings',
    price: 700,
    scores: [94, 90, 80, 80, 78],
  },
  {
    name: 'Chaat Corner Co.',
    what: 'Street-style chaat',
    price: 200,
    scores: [84, 66, 88, 99, 52],
  },
  { name: 'Ember & Naan', what: 'Modern Indian grill', price: 950, scores: [86, 74, 95, 50, 88] },
  { name: 'Little Seoul', what: 'Korean barbecue', price: 850, scores: [97, 88, 82, 64, 80] },
  {
    name: 'Dosa Theory',
    what: 'Dosas and filter coffee',
    price: 250,
    scores: [80, 76, 78, 92, 70],
  },
]

export const picks: Pick[] = [
  {
    name: 'Tokyo Table',
    emoji: '🍣',
    tint: 'rgba(240,138,115,.22)',
    match: 94,
    lines: [
      '4 of your friends went this month',
      '3 of them ordered the sushi',
      'People with your taste come back twice a month',
      '₹800–1,200 a head',
    ],
  },
  {
    name: 'Second Crack Coffee',
    emoji: '☕',
    tint: 'rgba(199,154,107,.22)',
    match: 88,
    lines: ['Your college friends are regulars', 'Loved by specialty coffee people', '1.2 km away'],
  },
  {
    name: 'The Butter Chicken House',
    emoji: '🍛',
    tint: 'rgba(229,122,35,.22)',
    match: 81,
    lines: ['Rahul has been here 12 times this month', 'Apparently, he has found his personality'],
  },
]

export const signals = ['Your taste', "Friends' visits", 'Repeat visits', 'Budget fit', 'Distance']

export const breakdowns: Breakdown[] = [
  {
    name: 'Tokyo Table',
    match: 94,
    bars: [38, 24, 16, 10, 6],
    caption:
      "Taste carries most of this match: you've saved four Japanese places, and three of your friends ordered the sushi here this month.",
  },
  {
    name: 'Second Crack Coffee',
    match: 88,
    bars: [30, 28, 14, 10, 6],
    caption: "Friends lead here: your college friends are regulars, and it's 1.2 km from campus.",
  },
  {
    name: 'The Butter Chicken House',
    match: 81,
    bars: [26, 30, 12, 9, 4],
    caption: 'Mostly Rahul. He has been here 12 times this month.',
  },
]

export const rupees = (n: number) => '₹' + n.toLocaleString('en-IN')
