import { DashboardData } from '../types';

// Mock data based on PARSER_README structure
// Replace this with actual data from sales_dashboard_data.json when available

export const mockDashboardData: DashboardData = {
  summary: {
    total_sales_cy: 430600.20,
    total_sales_py: 406627.91,
    total_sales_change: 23972.29,
    total_sales_pct_change: 5.9,

    direct_sales_cy: 394804.89,
    direct_sales_py: 367400.92,
    indirect_sales_cy: 35795.31,
    indirect_sales_py: 39226.99,

    total_accounts: 135,
    total_accounts_py: 131,
    account_average: 3189.63,
    retention_rate: 90.84,

    new_accounts: 9,
    new_accounts_sales: 8294.55,
    reactivated_accounts: 7,
    reactivated_accounts_sales: 7054.33,
    lost_accounts: 12,
    lost_accounts_sales: 11326.46,

    increasing_accounts: 44,
    increasing_accounts_sales: 75771.55,
    declining_accounts: 50,
    declining_accounts_sales: -56043.33,

    total_decline_amount: -68084.68,
    total_increase_amount: 92056.97,
    net_change: 23972.29
  },

  accounts: {
    top_declining: [
      {
        'Acct #': 94824,
        'Name': 'SUNDANCE OPTICAL',
        'City': 'FLAGSTAFF',
        'CY Total': 18198.67,
        'PY Total': 24753.41,
        'Difference': -6554.74
      },
      {
        'Acct #': 87234,
        'Name': 'NEVADA EYE PHYSICIANS',
        'City': 'LAS VEGAS',
        'CY Total': 15432.21,
        'PY Total': 20427.19,
        'Difference': -4994.98
      },
      {
        'Acct #': 76543,
        'Name': 'LAVEEN TOTAL EYECARE, LLC',
        'City': 'PHOENIX',
        'CY Total': 12654.88,
        'PY Total': 16992.47,
        'Difference': -4337.59
      },
      {
        'Acct #': 65432,
        'Name': 'DESERT VISION CENTER',
        'City': 'TUCSON',
        'CY Total': 9876.45,
        'PY Total': 13214.23,
        'Difference': -3337.78
      },
      {
        'Acct #': 54321,
        'Name': 'MOUNTAIN VIEW OPTICAL',
        'City': 'SCOTTSDALE',
        'CY Total': 11234.67,
        'PY Total': 14456.89,
        'Difference': -3222.22
      }
    ],

    top_increasing: [
      {
        'Acct #': 72443,
        'Name': 'CORONA OPTIQUE',
        'City': 'YUMA',
        'CY Total': 32353.79,
        'PY Total': 17442.30,
        'Difference': 14911.49
      },
      {
        'Acct #': 83456,
        'Name': 'PRECISION EYE CARE',
        'City': 'GILBERT',
        'CY Total': 28765.43,
        'PY Total': 16543.21,
        'Difference': 12222.22
      },
      {
        'Acct #': 91234,
        'Name': 'VISTA OPTICAL GROUP',
        'City': 'MESA',
        'CY Total': 25987.65,
        'PY Total': 15234.56,
        'Difference': 10753.09
      },
      {
        'Acct #': 78901,
        'Name': 'CLEAR VISION CENTER',
        'City': 'CHANDLER',
        'CY Total': 21456.78,
        'PY Total': 12345.67,
        'Difference': 9111.11
      },
      {
        'Acct #': 67890,
        'Name': 'ELITE EYECARE',
        'City': 'TEMPE',
        'CY Total': 19876.54,
        'PY Total': 11234.56,
        'Difference': 8641.98
      }
    ],

    new_accounts: [
      {
        'Acct #': 95633,
        'Name': 'MOHAVE EYE CENTER',
        'City': 'BULLHEAD CITY',
        'CY Total': 4486.12,
        'PY Total': 0,
        'Difference': 4486.12,
        'Project Code': 'TIER 1'
      },
      {
        'Acct #': 95734,
        'Name': 'SUNRISE OPTICAL',
        'City': 'PHOENIX',
        'CY Total': 3254.67,
        'PY Total': 0,
        'Difference': 3254.67,
        'Project Code': 'TIER 2'
      },
      {
        'Acct #': 95845,
        'Name': 'MODERN VISION',
        'City': 'TUCSON',
        'CY Total': 2876.45,
        'PY Total': 0,
        'Difference': 2876.45,
        'Project Code': 'TIER 1'
      }
    ],

    reactivated_accounts: [
      {
        'Acct #': 87727,
        'Name': 'HORIZON OPTICAL',
        'City': 'PHOENIX',
        'CY Total': 1332.33,
        'PY Total': 54.95,
        'Difference': 1277.38
      },
      {
        'Acct #': 88234,
        'Name': 'SOUTHWEST EYECARE',
        'City': 'MESA',
        'CY Total': 1156.78,
        'PY Total': 89.34,
        'Difference': 1067.44
      }
    ]
  },

  frames: {
    increasing: [
      {
        name: 'LIME',
        current_year: 11404,
        previous_year: 9632,
        change: 1772,
        pct_change: 18.4
      },
      {
        name: 'GREEN',
        current_year: 8765,
        previous_year: 7543,
        change: 1222,
        pct_change: 16.2
      },
      {
        name: 'BLACK DIAMOND',
        current_year: 15432,
        previous_year: 14567,
        change: 865,
        pct_change: 5.9
      }
    ],

    declining: [
      {
        name: 'SLIP-IN CASES',
        current_year: 4740,
        previous_year: 6700,
        change: -1960,
        pct_change: -29.2
      },
      {
        name: 'NOSE PADS',
        current_year: 4483,
        previous_year: 6325,
        change: -1842,
        pct_change: -29.1
      },
      {
        name: 'YELLOW',
        current_year: 3087,
        previous_year: 3229,
        change: -142,
        pct_change: -4.4
      }
    ],

    top_growth: [
      {
        name: 'LIME',
        current_year: 11404,
        previous_year: 9632,
        change: 1772,
        pct_change: 18.4
      },
      {
        name: 'GREEN',
        current_year: 8765,
        previous_year: 7543,
        change: 1222,
        pct_change: 16.2
      },
      {
        name: 'BLACK DIAMOND',
        current_year: 15432,
        previous_year: 14567,
        change: 865,
        pct_change: 5.9
      },
      {
        name: 'BLUE',
        current_year: 9234,
        previous_year: 8765,
        change: 469,
        pct_change: 5.3
      },
      {
        name: 'RED',
        current_year: 7654,
        previous_year: 7321,
        change: 333,
        pct_change: 4.5
      }
    ],

    top_decline: [
      {
        name: 'SLIP-IN CASES',
        current_year: 4740,
        previous_year: 6700,
        change: -1960,
        pct_change: -29.2
      },
      {
        name: 'NOSE PADS',
        current_year: 4483,
        previous_year: 6325,
        change: -1842,
        pct_change: -29.1
      },
      {
        name: 'YELLOW',
        current_year: 3087,
        previous_year: 3229,
        change: -142,
        pct_change: -4.4
      },
      {
        name: 'PARTS',
        current_year: 300,
        previous_year: 385,
        change: -85,
        pct_change: -22.1
      },
      {
        name: 'TOOLS',
        current_year: 2,
        previous_year: 45,
        change: -43,
        pct_change: -95.6
      }
    ]
  },

  brands: {
    brands: [
      {
        brand: 'MODERN PLASTICS II',
        total_units: 21175,
        account_count: 108,
        avg_units_per_account: 196.06
      },
      {
        brand: 'MODERN PLASTICS I',
        total_units: 11404,
        account_count: 95,
        avg_units_per_account: 120.04
      },
      {
        brand: 'CASES - CLAMSHELL',
        total_units: 10434,
        account_count: 87,
        avg_units_per_account: 119.93
      },
      {
        brand: 'MODERN METALS',
        total_units: 8201,
        account_count: 76,
        avg_units_per_account: 107.91
      },
      {
        brand: 'CLEANING CLOTHS',
        total_units: 5600,
        account_count: 92,
        avg_units_per_account: 60.87
      },
      {
        brand: 'CASES - SLIP IN',
        total_units: 4740,
        account_count: 68,
        avg_units_per_account: 69.71
      },
      {
        brand: 'NOSE PADS',
        total_units: 4483,
        account_count: 54,
        avg_units_per_account: 83.02
      },
      {
        brand: 'MODERN TIMES',
        total_units: 3479,
        account_count: 43,
        avg_units_per_account: 80.91
      },
      {
        brand: 'BRANDED CASES',
        total_units: 2401,
        account_count: 38,
        avg_units_per_account: 63.18
      },
      {
        brand: 'B.M.E.C.',
        total_units: 1405,
        account_count: 29,
        avg_units_per_account: 48.45
      }
    ],
    top_brands: [
      {
        brand: 'MODERN PLASTICS II',
        total_units: 21175,
        account_count: 108,
        avg_units_per_account: 196.06
      },
      {
        brand: 'MODERN PLASTICS I',
        total_units: 11404,
        account_count: 95,
        avg_units_per_account: 120.04
      },
      {
        brand: 'CASES - CLAMSHELL',
        total_units: 10434,
        account_count: 87,
        avg_units_per_account: 119.93
      }
    ],
    total_brands_sold: 25
  },

  insights: [
    'URGENT: SUNDANCE OPTICAL declined by $6,554.74',
    'TOP PERFORMER: CORONA OPTIQUE increased by $14,911.49',
    'Frame Alert: SLIP-IN CASES sales down 1960 units (-29.2% decline)',
    'Frame Opportunity: LIME sales up 1772 units (18.4% growth)',
    '50 of 135 accounts (37.0%) are declining',
    '9 new accounts added, generating $8,294.55',
    '7 accounts reactivated, bringing in $7,054.33'
  ]
};
