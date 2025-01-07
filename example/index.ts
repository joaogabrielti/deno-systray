import { open } from 'https://deno.land/x/open@v1.0.0/index.ts';
import SysTray, { Menu, MenuItem } from '../mod.ts';

function getIconUrl() {
  const { os } = Deno.build;
  const iconUrl = `${Deno.cwd()}/example`;

  let icon;

  switch (os) {
    case 'windows':
      icon = `${iconUrl}/icon.ico`.replaceAll('/', '\\');
      break;
    case 'darwin':
    case 'linux':
      icon = `${iconUrl}/icon.png`;
      break;
    default:
      throw new Error(`Unsupported operating system: ${os}`);
  }

  return icon;
}

const icon = getIconUrl();

interface MenuItemClickable extends MenuItem {
  click?: () => void;
  items?: MenuItemClickable[];
}

interface CustomMenu extends Menu {
  items: MenuItemClickable[];
}

const menu: CustomMenu = {
  icon,
  isTemplateIcon: Deno.build.os === 'darwin',
  title: 'Title',
  tooltip: 'Tooltip',
  items: [
    {
      title: 'Item 1',
      tooltip: 'the first item',
      checked: true,
      enabled: true,
      click() {
        const item1Idx = 0;
        const item2Idx = 1;
        menu.items[item1Idx].checked = !menu.items[item1Idx].checked;
        menu.items[item2Idx].checked = !menu.items[item1Idx].checked;
        systray.sendAction({
          type: 'update-item',
          item: menu.items[item1Idx],
          seq_id: item1Idx,
        });
        systray.sendAction({
          type: 'update-item',
          item: menu.items[item2Idx],
          seq_id: item2Idx,
        });
      },
    },
    {
      'title': 'Item 2',
      'tooltip': 'the second item',
      'checked': false,
      'enabled': true,
      click() {
        const item1Idx = 0;
        const item2Idx = 1;
        menu.items[item2Idx].checked = !menu.items[item2Idx].checked;
        menu.items[item1Idx].checked = !menu.items[item2Idx].checked;
        systray.sendAction({
          type: 'update-item',
          item: menu.items[item1Idx],
          seq_id: item1Idx,
        });
        systray.sendAction({
          type: 'update-item',
          item: menu.items[item2Idx],
          seq_id: item2Idx,
        });
      },
    },
    SysTray.separator,
    {
      title: 'GitHub',
      tooltip: 'Go to repository',
      checked: false,
      click() {
        open('https://github.com/joaogabrielti/deno-systray');
      },
    },
    {
      'title': 'Item with submenu',
      'tooltip': 'submenu',
      'checked': false,
      'enabled': true,
      'items': [{
        'title': 'submenu 1',
        'tooltip': 'this is submenu 1',
        'checked': true,
        'enabled': true,
      }, {
        'title': 'submenu 2',
        'tooltip': 'this is submenu 2',
        'checked': true,
        'enabled': true,
      }],
    },
    {
      title: 'Exit',
      tooltip: 'Exit the tray menu',
      checked: false,
      enabled: true,
      click() {
        systray.kill();
      },
    },
  ],
};

const systray = new SysTray({
  menu,
  debug: true,
  directory: 'bin',
});

systray.on('click', (action) => {
  if ((action.item as MenuItemClickable).click) {
    (action.item as MenuItemClickable).click!();
  }
});

systray.on('exit', (d) => {
  console.log(d);
});

systray.on('error', () => {
  console.log();
});
