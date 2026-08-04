// Real Google reviews for EnDesign, copied by hand as a temporary stand-in
// until a live Google API/widget integration is set up (see project notes).
// Source: https://www.google.com/maps/place/?q=place_id:ChIJV71UFu7P1EARRWslzD4wFso
// Snapshot date: 2026-08-04 — aggregate 5.0★ across 27 reviews (all 5-star).

export const GOOGLE_PLACE_ID = 'ChIJV71UFu7P1EARRWslzD4wFso'
export const GOOGLE_REVIEWS_URL = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`
export const GOOGLE_RATING = 5.0
export const GOOGLE_REVIEW_COUNT = 27

export type GoogleReview = {
  name: string
  avatar: string
  relativeTime: string
  text: string
}

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    name: 'Jenny Kulikovskaya',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjVq525LdDflgc5GC_eZiw0oeaL6D2UcEri_GyeHEzuHtOFD_e2Z=w96-h96-p-rp-mo-br100',
    relativeTime: 'день тому',
    text: 'Велика подяка Євгену за професійну та швидку роботу! 🙌 Він уважно поставився до наших побажань, якісно підготував файл візитівок до друку й допоміг отримати саме той результат, який ми хотіли. Дуже цінуємо відповідальність, уважність до деталей і чудове ставлення до клієнтів. Рекомендуємо! 🤍',
  },
  {
    name: 'Людмила Володина',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocK8m4J834Vm1FLYwu8ut-RusF7YSCyNWdk3_qZe1-Csnki8-g=w96-h96-p-rp-mo-br100',
    relativeTime: '2 місяці тому',
    text: 'Дуже задоволена роботою — стильний, якісний дизайн, все зроблено швидко, рекомендую!',
  },
  {
    name: 'Юлия Хлудеева',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjV43GiBT18AAhPUMpx1r8YDas8aRxJvhStdfVY4102BN1cqVRkY0Q=w96-h96-p-rp-mo-ba12-br100',
    relativeTime: '2 місяці тому',
    text: 'Хочу висловити величезну подяку дизайнеру за просто неймовірну роботу! 😍 Дизайн сертифікату вийшов саме таким, як ми мріяли – стильний, дорогий, сучасний та дуже естетичний. Були враховані всі наші побажання, кожна деталь продумана до дрібниць. Окремо хочеться відзначити смак, почуття стилю та терпіння у роботі — все було виконано ідеально та з душею.',
  },
  {
    name: 'Юлия Шляхтун',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocLQPbvycudtch0MjIflcGpfh7YPd4ggyLDfffucPwm-tWaXbg=w96-h96-p-rp-mo-br100',
    relativeTime: '2 місяці тому',
    text: 'Замовляла рекламний банер — лишилася дуже задоволена! Зробили все швидко, якісно та саме так, як я хотіла. Дизайн вийшов стильний, яскравий і привертає увагу. Окреме спасибі за терпіння та увагу до деталей, врахували усі мої побажання. Однозначно рекомендую, якщо хочете гарну та якісну рекламу! ✨',
  },
  {
    name: 'АЛЕКСЕЙ ЮВЕНТУС',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjWxKUayC92-y0ZaHX-j7DXpcbk82fitaWSBElTf0At886Tk4Lo=w96-h96-p-rp-mo-br100',
    relativeTime: '2 місяці тому',
    text: 'Дякую за чудову роботу! Дизайн реклами вийшов стильним та якісним, все було зроблено швидко та з урахуванням моїх побажань. Рекомендую!',
  },
  {
    name: 'Taras Yakovenko',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocKiD3Ca6ynLCghr04UT4jPwbvQNAKVmH9tGr7qBTb28crx5vHVE=w96-h96-p-rp-mo-br100',
    relativeTime: '5 місяців тому',
    text: 'Замовляли т-гру у Євгена. Все дуже швидко, професійно та якісно, і дуже адекватно по вартості. Євген зрозумів мій запит одразу, а дизайнер Любов все зробила в найкращому виконанні. Від щирого серця дякую та бажаю вам процвітання🙏🙏🙏',
  },
  {
    name: 'Елена Я.',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocLvYQsiTvfLxrni-WmHTN9L21J-sNI8UUPvlanHKnfBFI9N-w=w96-h96-p-rp-mo-br100',
    relativeTime: 'рік тому',
    text: 'Дуже рідко пишу відгуки, але тут я не змогла промовчати. Якщо ви хочете швидко та якісно зробити дизайн та надрукувати флаєри — то вам сюди. Хочу подякувати Євгенію за професіоналізм, за оперативність. Щоб ви розуміли: в пʼятницю о 17:30 ми погодили макет, за 20 хвилин Євгеній його відкоригував, і в суботу о 13:30 ми вже забрали готові 500 флаєрів. Дуже рекомендую!',
  },
  {
    name: 'Yana',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjU898UaWwJK6UasPW2iENadZWh6iSd2wLWAFVsSG8-u3CL-W0subg=w96-h96-p-rp-mo-br100',
    relativeTime: 'рік тому',
    text: 'Замовляли три банери на терміновий друк (в четвер замовили і повинні отримати в пʼятницю). Майстер своєї справи, швидка реакція та відповідь. Врахував всі побажання та зробив краще, ніж планувалось. За короткий термін він зробив готові макети зі зразку, також встигли подати на друк 600 листівок. Результатом задоволені всі!',
  },
  {
    name: 'УКРАЇНА ІНФОРМ',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjXY6-3SFhsvASQJzT_HM64B-LB4kD33gU-BK5QT9Q_IRHFDg8Vd=w96-h96-p-rp-mo-br100',
    relativeTime: 'рік тому',
    text: 'Інформаційне агентство УКРАЇНА ІНФОРМ висловлює щиру вдячність колективу дизайнерської студії, а також особисто засновнику компанії — Білову Євгену, за високий професіоналізм, креативність і відповідальне ставлення до справи. Кожен проєкт перетворюється на візуально досконалий та змістовно наповнений продукт, що відповідає сучасним стандартам і перевершує очікування.',
  },
  {
    name: 'Ольга Корнилова',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjXwUuqaHcrFmlW4jJTFEEHMZJk2VvTtBm9ztxkRNKECx1oRwVSg=w96-h96-p-rp-mo-br100',
    relativeTime: 'рік тому',
    text: 'Звернулися до компанії за розробкою макета для зовнішньої реклами. Все швидко, якісно, миттєва реакція на всі прохання. Дуже задоволені. Однозначно додали контакти собі у скарбничку для подальшої співпраці.',
  },
  {
    name: 'Настя Токарчук',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocLhJK-WH2UBtYfzz8RjX_G1CTutBeZAgyLoumnTZFdkAuxQOw=w96-h96-p-rp-mo-br100',
    relativeTime: 'рік тому',
    text: 'Звернулися до компанії за дизайном білборда. Дуже задоволені результатом) Євген справжній профі своєї справи, зробив все швидко та на високому рівні!',
  },
  {
    name: 'Алена Шрамченко/Лукьяненко',
    avatar:
      'https://lh3.googleusercontent.com/a-/ALV-UjVS9sQjFCy5VGcPt7O5CZj92SCWT0F9o3Ef1ghzteFUWy7U7ruo=w96-h96-p-rp-mo-br100',
    relativeTime: 'рік тому',
    text: "Зверталася для розробки макетів різних видів календарів для компанії. Євгеній весь час був на зв'язку, дуже швидко приймалися побажання до макетів, за дуже короткий термін виконав свою роботу на високому професійному рівні! Якщо потрібні будуть ще послуги дизайнера — однозначно буду звертатися до Євгенія!",
  },
]
