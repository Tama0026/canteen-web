import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { FullMenuDatabase, CycleKey, ShiftKey, MealTypeKey, DayKey, DAY_KEYS } from '@/types/menu';
import { INITIAL_MENU_DATABASE } from '@/data/initial-menu';


let localDatabaseCache: FullMenuDatabase = JSON.parse(JSON.stringify(INITIAL_MENU_DATABASE));
let localDkChayCache: { date: string, registrations: any[] } = { date: '', registrations: [] };

function getSql(): NeonQueryFunction<false, false> | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === '' || databaseUrl.includes('placeholder')) {
    return null;
  }
  try {
    return neon(databaseUrl);
  } catch (error) {
    console.error('Lỗi khởi tạo Neon DB Client:', error);
    return null;
  }
}


export async function initDatabaseSchema() {
  const sql = getSql();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS canteen_menu (
        id SERIAL PRIMARY KEY,
        cycle_key VARCHAR(32) NOT NULL,
        shift_key VARCHAR(32) NOT NULL,
        meal_type VARCHAR(32) NOT NULL,
        day_key VARCHAR(32) NOT NULL,
        main_dish_1 TEXT DEFAULT '',
        main_dish_2 TEXT DEFAULT '',
        side_dish TEXT DEFAULT '',
        soup TEXT DEFAULT '',
        dessert TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(cycle_key, shift_key, meal_type, day_key)
      );

      CREATE TABLE IF NOT EXISTS canteen_dkchay (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        is_lunch BOOLEAN DEFAULT false,
        is_dinner BOOLEAN DEFAULT false,
        reg_date VARCHAR(20) NOT NULL
      );
    `;

    
    const countRes = await sql`SELECT COUNT(*) as count FROM canteen_menu;`;
    const count = parseInt(countRes[0]?.count || '0', 10);

    if (count === 0) {
      console.log('🌱 Đang nạp dữ liệu menu ban đầu vào Neon Postgres...');
      await seedDatabaseFromInitial();
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra / tạo schema Neon DB:', error);
  }
}


export async function seedDatabaseFromInitial() {
  const sql = getSql();
  if (!sql) return;

  const cycles: CycleKey[] = ['cycle_1_3', 'cycle_2_4'];
  const shifts: ShiftKey[] = ['morning', 'afternoon'];
  const mealTypes: MealTypeKey[] = ['regular', 'vegetarian'];

  for (const cycle of cycles) {
    for (const shift of shifts) {
      for (const mealType of mealTypes) {
        for (const day of DAY_KEYS) {
          const item = INITIAL_MENU_DATABASE[cycle][shift][mealType][day];
          if (item) {
            await sql`
              INSERT INTO canteen_menu (cycle_key, shift_key, meal_type, day_key, main_dish_1, main_dish_2, side_dish, soup, dessert, updated_at)
              VALUES (${cycle}, ${shift}, ${mealType}, ${day}, ${item.mainDish1 || ''}, ${item.mainDish2 || ''}, ${item.sideDish || ''}, ${item.soup || ''}, ${item.dessert || ''}, NOW())
              ON CONFLICT (cycle_key, shift_key, meal_type, day_key)
              DO UPDATE SET
                main_dish_1 = EXCLUDED.main_dish_1,
                main_dish_2 = EXCLUDED.main_dish_2,
                side_dish = EXCLUDED.side_dish,
                soup = EXCLUDED.soup,
                dessert = EXCLUDED.dessert,
                updated_at = NOW();
            `;
          }
        }
      }
    }
  }
}


export async function getFullMenu(): Promise<FullMenuDatabase> {
  const sql = getSql();
  if (!sql) {
    return localDatabaseCache;
  }

  try {
    await initDatabaseSchema();
    const rows = await sql`
      SELECT cycle_key, shift_key, meal_type, day_key, main_dish_1, main_dish_2, side_dish, soup, dessert, updated_at
      FROM canteen_menu;
    `;

    if (!rows || rows.length === 0) {
      return localDatabaseCache;
    }

    
    const dbData: FullMenuDatabase = JSON.parse(JSON.stringify(INITIAL_MENU_DATABASE));
    let latestUpdate = '';

    for (const row of rows) {
      const c = row.cycle_key as CycleKey;
      const s = row.shift_key as ShiftKey;
      const m = row.meal_type as MealTypeKey;
      const d = row.day_key as DayKey;

      if (dbData[c]?.[s]?.[m]?.[d]) {
        dbData[c][s][m][d] = {
          mainDish1: row.main_dish_1 || '',
          mainDish2: row.main_dish_2 || '',
          sideDish: row.side_dish || '',
          soup: row.soup || '',
          dessert: row.dessert || '',
        };
      }
      if (row.updated_at) {
        latestUpdate = row.updated_at.toString();
      }
    }

    dbData.lastUpdated = latestUpdate || new Date().toISOString();
    return dbData;
  } catch (error) {
    console.error('Lỗi khi truy vấn Neon Postgres, fallback về cache:', error);
    return localDatabaseCache;
  }
}


export async function updateMenuItem(
  cycle: CycleKey,
  shift: ShiftKey,
  mealType: MealTypeKey,
  day: DayKey,
  item: {
    mainDish1: string;
    mainDish2?: string;
    sideDish?: string;
    soup?: string;
    dessert?: string;
  }
): Promise<boolean> {
  
  if (localDatabaseCache[cycle]?.[shift]?.[mealType]?.[day]) {
    localDatabaseCache[cycle][shift][mealType][day] = {
      mainDish1: item.mainDish1 || '',
      mainDish2: item.mainDish2 || '',
      sideDish: item.sideDish || '',
      soup: item.soup || '',
      dessert: item.dessert || '',
    };
    localDatabaseCache.lastUpdated = new Date().toISOString();
  }

  const sql = getSql();
  if (!sql) return true;

  try {
    await initDatabaseSchema();
    await sql`
      INSERT INTO canteen_menu (cycle_key, shift_key, meal_type, day_key, main_dish_1, main_dish_2, side_dish, soup, dessert, updated_at)
      VALUES (${cycle}, ${shift}, ${mealType}, ${day}, ${item.mainDish1 || ''}, ${item.mainDish2 || ''}, ${item.sideDish || ''}, ${item.soup || ''}, ${item.dessert || ''}, NOW())
      ON CONFLICT (cycle_key, shift_key, meal_type, day_key)
      DO UPDATE SET
        main_dish_1 = EXCLUDED.main_dish_1,
        main_dish_2 = EXCLUDED.main_dish_2,
        side_dish = EXCLUDED.side_dish,
        soup = EXCLUDED.soup,
        dessert = EXCLUDED.dessert,
        updated_at = NOW();
    `;
    return true;
  } catch (error) {
    console.error('Lỗi khi cập nhật món ăn vào Neon DB:', error);
    return false;
  }
}


export async function saveFullMenu(fullMenu: FullMenuDatabase): Promise<boolean> {
  localDatabaseCache = JSON.parse(JSON.stringify(fullMenu));
  localDatabaseCache.lastUpdated = new Date().toISOString();

  const sql = getSql();
  if (!sql) return true;

  try {
    await initDatabaseSchema();
    const cycles: CycleKey[] = ['cycle_1_3', 'cycle_2_4'];
    const shifts: ShiftKey[] = ['morning', 'afternoon'];
    const mealTypes: MealTypeKey[] = ['regular', 'vegetarian'];

    for (const cycle of cycles) {
      for (const shift of shifts) {
        for (const mealType of mealTypes) {
          for (const day of DAY_KEYS) {
            const item = fullMenu[cycle]?.[shift]?.[mealType]?.[day];
            if (item) {
              await sql`
                INSERT INTO canteen_menu (cycle_key, shift_key, meal_type, day_key, main_dish_1, main_dish_2, side_dish, soup, dessert, updated_at)
                VALUES (${cycle}, ${shift}, ${mealType}, ${day}, ${item.mainDish1 || ''}, ${item.mainDish2 || ''}, ${item.sideDish || ''}, ${item.soup || ''}, ${item.dessert || ''}, NOW())
                ON CONFLICT (cycle_key, shift_key, meal_type, day_key)
                DO UPDATE SET
                  main_dish_1 = EXCLUDED.main_dish_1,
                  main_dish_2 = EXCLUDED.main_dish_2,
                  side_dish = EXCLUDED.side_dish,
                  soup = EXCLUDED.soup,
                  dessert = EXCLUDED.dessert,
                  updated_at = NOW();
              `;
            }
          }
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu full menu vào Neon DB:', error);
    return false;
  }
}

export async function getDkChayRegistrations(today: string) {
  const sql = getSql();
  if (!sql) {
    if (localDkChayCache.date !== today) {
      localDkChayCache = { date: today, registrations: [] };
    }
    return localDkChayCache.registrations;
  }
  try {
    await initDatabaseSchema();
    await sql`DELETE FROM canteen_dkchay WHERE reg_date != ${today}`;
    const rows = await sql`SELECT id, name, is_lunch, is_dinner FROM canteen_dkchay WHERE reg_date = ${today}`;
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      isLunch: r.is_lunch,
      isDinner: r.is_dinner
    }));
  } catch(e) {
    console.error('Lỗi getDkChayRegistrations:', e);
    return [];
  }
}

export async function saveDkChayRegistrations(registrations: any[], today: string) {
  const sql = getSql();
  if (!sql) {
    localDkChayCache = { date: today, registrations };
    return true;
  }
  try {
    await initDatabaseSchema();
    await sql`DELETE FROM canteen_dkchay WHERE reg_date = ${today}`;
    if (registrations.length > 0) {
      for (const reg of registrations) {
        await sql`INSERT INTO canteen_dkchay (id, name, is_lunch, is_dinner, reg_date) VALUES (${reg.id}, ${reg.name}, ${reg.isLunch}, ${reg.isDinner}, ${today})`;
      }
    }
    return true;
  } catch(e) {
    console.error('Lỗi saveDkChayRegistrations:', e);
    return false;
  }
}
