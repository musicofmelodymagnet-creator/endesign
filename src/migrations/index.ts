import * as migration_20260801_003547_initial from './20260801_003547_initial';
import * as migration_20260804_121402_add_iconlist_kicker_and_pageseo from './20260804_121402_add_iconlist_kicker_and_pageseo';
import * as migration_20260804_134653_add_google_reviews_widget_id from './20260804_134653_add_google_reviews_widget_id';

export const migrations = [
  {
    up: migration_20260801_003547_initial.up,
    down: migration_20260801_003547_initial.down,
    name: '20260801_003547_initial',
  },
  {
    up: migration_20260804_121402_add_iconlist_kicker_and_pageseo.up,
    down: migration_20260804_121402_add_iconlist_kicker_and_pageseo.down,
    name: '20260804_121402_add_iconlist_kicker_and_pageseo',
  },
  {
    up: migration_20260804_134653_add_google_reviews_widget_id.up,
    down: migration_20260804_134653_add_google_reviews_widget_id.down,
    name: '20260804_134653_add_google_reviews_widget_id'
  },
];
