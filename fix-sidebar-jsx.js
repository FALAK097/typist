const fs = require('fs');
const file = 'apps/desktop/src/components/Sidebar.tsx';
let code = fs.readFileSync(file, 'utf8');

const invalidJSX = `          {showMenu && (

              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute left-full top-0 ml-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[140px]">`;

const validJSX = `          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute left-full top-0 ml-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[140px]">`;

code = code.replace(invalidJSX, validJSX);

const invalidJSXClose = `              </button>
            </div>
          )}`;

const validJSXClose = `              </button>
            </div>
            </>
          )}`;

code = code.replace(invalidJSXClose, validJSXClose);
fs.writeFileSync(file, code);
