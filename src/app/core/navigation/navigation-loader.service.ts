import { Injectable } from '@angular/core';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { NavigationItem } from './navigation-item.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor(private readonly layoutService: VexLayoutService) {
    this.loadNavigation();
  }

  loadNavigation(): void {
    this._items.next([
      // {
      //   type: 'subheading',
      //   label: 'Dashboards',
      //   children: [
      //     {
      //       type: 'link',
      //       label: 'Analytics',
      //       route: '/',
      //       icon: 'mat:insights',
      //       routerLinkActiveOptions: { exact: true }
      //     }
      //   ]
      // },
      {
        type: 'subheading',
        label: 'Administración',
        children: [
          {
            type: 'link',
            label: 'Dashboard',
            icon: 'mat:dashboard'
          },
          {
            type: 'link',
            label: 'Usuarios',
            route: '/administracion/usuarios',
            icon: 'mat:group'
          },
          {
            type: 'link',
            label: 'Clientes',
            route: '/administracion/clientes',
            icon: 'mat:people_alt'
          },
          {
            type: 'link',
            label: 'Validadores',
            route: '/administracion/dispositivos',
            icon: 'mat:verified'
          },
          {
            type: 'link',
            label: 'Contadores',
            route: '/administracion/contadora',
            icon: 'mat:calculate'
          },
          {
            type: 'link',
            label: 'Vehículos',
            route: '/administracion/vehiculos',
            icon: 'mat:time_to_leave'
          },
          {
            type: 'link',
            label: 'Operadores',
            route: '/administracion/operadores',
            icon: 'mat:group',
          },
          {
            type: 'link',
            label: 'Monederos',
            route: '/administracion/monederos',
            icon: 'mat:monetization_on',
          },
          {
            type: 'link',
            label: 'Pasajeros',
            route: '/administracion/pasajeros',
            icon: 'mat:directions_walk',
          },
          {
            type: 'link',
            label: 'Rutas',
            route: '/administracion/rutas',
            icon: 'mat:map',
          },
          // {
          //   type: 'link',
          //   label: 'Monitoreo',
          //   route: '/administracion/monitoreo',
          //   icon: 'mat:monitor_heart',
          // },
          {
            type: 'link',
            label: 'Transacciones',
            route: '/administracion/transacciones',
            icon: 'mat:assessment'
          },
          {
            type: 'link',
            label: 'Bitacora',
            route: '/administracion/bitacora',
            icon: 'mat:assignment',
          },
          {
            type: 'link',
            label: 'Permisos',
            route: '/administracion/permisos',
            icon: 'mat:lock'
          },
          {
            type: 'link',
            label: 'Módulos',
            route: '/administracion/modulos',
            icon: 'mat:apps'
          },
          {
            type: 'link',
            label: 'Roles',
            icon: 'mat:group'
          }
          // {
          //   type: 'link',
          //   label: 'Perfil de Usuario',
          //   route: '/administracion/perfil-usuario',
          //   icon: 'mat:person',
          // },
        ]
      },
      // {
      //   type: 'subheading',
      //   label: 'Pages',
      //   children: [
      //     {
      //       type: 'dropdown',
      //       label: 'Authentication',
      //       icon: 'mat:lock',
      //       children: [
      //         {
      //           type: 'link',
      //           label: 'Login',
      //           route: '/login'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Register',
      //           route: '/register'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Forgot Password',
      //           route: '/forgot-password'
      //         }
      //       ]
      //     },
      //     {
      //       type: 'link',
      //       label: 'Coming Soon',
      //       icon: 'mat:watch_later',
      //       route: '/coming-soon'
      //     },
      //     {
      //       type: 'dropdown',
      //       label: 'Errors',
      //       icon: 'mat:error',
      //       badge: {
      //         value: '4',
      //         bgClass: 'bg-green-600',
      //         textClass: 'text-white'
      //       },
      //       children: [
      //         {
      //           type: 'link',
      //           label: '404',
      //           route: '/pages/error-404'
      //         },
      //         {
      //           type: 'link',
      //           label: '500',
      //           route: '/pages/error-500'
      //         }
      //       ]
      //     },
      //     {
      //       type: 'link',
      //       label: 'Pricing',
      //       icon: 'mat:attach_money',
      //       route: '/pages/pricing'
      //     },
      //     {
      //       type: 'link',
      //       label: 'Invoice',
      //       icon: 'mat:receipt',
      //       route: '/pages/invoice'
      //     },
      //     {
      //       type: 'link',
      //       label: 'FAQ',
      //       icon: 'mat:help',
      //       route: '/pages/faq'
      //     },
      //     {
      //       type: 'link',
      //       label: 'Guides',
      //       icon: 'mat:book',
      //       route: '/pages/guides',
      //       badge: {
      //         value: '18',
      //         bgClass: 'bg-teal-600',
      //         textClass: 'text-white'
      //       }
      //     }
      //   ]
      // },
      // {
      //   type: 'subheading',
      //   label: 'UI Elements',
      //   children: [
      //     {
      //       type: 'dropdown',
      //       label: 'Components',
      //       icon: 'mat:bubble_chart',
      //       children: [
      //         {
      //           type: 'link',
      //           label: 'Overview',
      //           route: '/ui/components/overview'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Autocomplete',
      //           route: '/ui/components/autocomplete'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Buttons',
      //           route: '/ui/components/buttons'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Button Group',
      //           route: '/ui/components/button-group'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Cards',
      //           route: '/ui/components/cards'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Checkbox',
      //           route: '/ui/components/checkbox'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Dialogs',
      //           route: '/ui/components/dialogs'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Grid List',
      //           route: '/ui/components/grid-list'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Input',
      //           route: '/ui/components/input'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Lists',
      //           route: '/ui/components/lists'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Menu',
      //           route: '/ui/components/menu'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Progress',
      //           route: '/ui/components/progress'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Progress Spinner',
      //           route: '/ui/components/progress-spinner'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Radio',
      //           route: '/ui/components/radio'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Slide Toggle',
      //           route: '/ui/components/slide-toggle'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Slider',
      //           route: '/ui/components/slider'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Snack Bar',
      //           route: '/ui/components/snack-bar'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Tooltip',
      //           route: '/ui/components/tooltip'
      //         }
      //       ]
      //     },
      //     {
      //       type: 'dropdown',
      //       label: 'Forms',
      //       icon: 'mat:format_color_text',
      //       children: [
      //         {
      //           type: 'link',
      //           label: 'Form Elements',
      //           route: '/ui/forms/form-elements'
      //         },
      //         {
      //           type: 'link',
      //           label: 'Form Wizard',
      //           route: '/ui/forms/form-wizard'
      //         }
      //       ]
      //     },
      //     {
      //       type: 'dropdown',
      //       label: 'Icons',
      //       icon: 'mat:star',
      //       children: [
      //         {
      //           type: 'link',
      //           label: 'Material Icons',
      //           route: '/ui/icons/ic'
      //         },
      //         {
      //           type: 'link',
      //           label: 'FontAwesome Icons',
      //           route: '/ui/icons/fa'
      //         }
      //       ]
      //     },
      //     {
      //       type: 'dropdown',
      //       label: 'Page Layouts',
      //       icon: 'mat:view_compact',
      //       children: [
      //         {
      //           type: 'dropdown',
      //           label: 'Card',
      //           children: [
      //             {
      //               type: 'link',
      //               label: 'Default',
      //               route: '/ui/page-layouts/card',
      //               routerLinkActiveOptions: { exact: true }
      //             },
      //             {
      //               type: 'link',
      //               label: 'Tabbed',
      //               route: '/ui/page-layouts/card/tabbed'
      //             },
      //             {
      //               type: 'link',
      //               label: 'Large Header',
      //               route: '/ui/page-layouts/card/large-header',
      //               routerLinkActiveOptions: { exact: true }
      //             },
      //             {
      //               type: 'link',
      //               label: 'Tabbed & Large Header',
      //               route: '/ui/page-layouts/card/large-header/tabbed'
      //             }
      //           ]
      //         },
      //         {
      //           type: 'dropdown',
      //           label: 'Simple',
      //           children: [
      //             {
      //               type: 'link',
      //               label: 'Default',
      //               route: '/ui/page-layouts/simple',
      //               routerLinkActiveOptions: { exact: true }
      //             },
      //             {
      //               type: 'link',
      //               label: 'Tabbed',
      //               route: '/ui/page-layouts/simple/tabbed'
      //             },
      //             {
      //               type: 'link',
      //               label: 'Large Header',
      //               route: '/ui/page-layouts/simple/large-header',
      //               routerLinkActiveOptions: { exact: true }
      //             },
      //             {
      //               type: 'link',
      //               label: 'Tabbed & Large Header',
      //               route: '/ui/page-layouts/simple/large-header/tabbed'
      //             }
      //           ]
      //         },
      //         {
      //           type: 'link',
      //           label: 'Blank',
      //           icon: 'mat:picture_in_picture',
      //           route: '/ui/page-layouts/blank'
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   type: 'subheading',
      //   label: 'Documentation',
      //   children: [
      //     {
      //       type: 'link',
      //       label: 'Changelog',
      //       route: '/documentation/changelog',
      //       icon: 'mat:update'
      //     },
      //     {
      //       type: 'dropdown',
      //       label: 'Getting Started',
      //       icon: 'mat:book',
      //       children: [
      //         {
      //           type: 'link',
      //           label: 'Introduction',
      //           route: '/documentation/introduction',
      //           fragment: 'introduction',
      //           routerLinkActiveOptions: { exact: true }
      //         },
      //         {
      //           type: 'link',
      //           label: 'Folder Structure',
      //           route: '/documentation/folder-structure',
      //           fragment: 'folder-structure',
      //           routerLinkActiveOptions: { exact: true }
      //         },
      //         {
      //           type: 'link',
      //           label: 'Installation',
      //           route: '/documentation/installation',
      //           fragment: 'installation',
      //           routerLinkActiveOptions: { exact: true }
      //         },
      //         {
      //           type: 'link',
      //           label: 'Development Server',
      //           route: '/documentation/start-development-server',
      //           fragment: 'start-development-server',
      //           routerLinkActiveOptions: { exact: true }
      //         },
      //         {
      //           type: 'link',
      //           label: 'Build for Production',
      //           route: '/documentation/build-for-production',
      //           fragment: 'build-for-production',
      //           routerLinkActiveOptions: { exact: true }
      //         }
      //       ]
      //     },
      //     {
      //       type: 'dropdown',
      //       label: 'Customization',
      //       icon: 'mat:book',
      //       children: [
      //         {
      //           type: 'link',
      //           label: 'Configuration',
      //           route: '/documentation/configuration',
      //           fragment: 'configuration',
      //           routerLinkActiveOptions: { exact: true }
      //         },
      //         {
      //           type: 'link',
      //           label: 'Changing Styling',
      //           route: '/documentation/changing-styling-and-css-variables',
      //           fragment: 'changing-styling-and-css-variables',
      //           routerLinkActiveOptions: { exact: true }
      //         },
      //         {
      //           type: 'link',
      //           label: 'Using Custom Colors',
      //           route:
      //             '/documentation/using-custom-colors-for-the-primarysecondarywarn-palettes',
      //           fragment:
      //             'using-custom-colors-for-the-primarysecondarywarn-palettes',
      //           routerLinkActiveOptions: { exact: true }
      //         },
      //         {
      //           type: 'link',
      //           label: 'Adding Menu Items',
      //           route: '/documentation/adding-menu-items',
      //           fragment: 'adding-menu-items',
      //           routerLinkActiveOptions: { exact: true }
      //         }
      //       ]
      //     },
      //     {
      //       type: 'link',
      //       label: 'Further Help',
      //       icon: 'mat:book',
      //       route: '/documentation/further-help',
      //       fragment: 'further-help',
      //       routerLinkActiveOptions: { exact: true }
      //     }
      //   ]
      // },
      // {
      //   type: 'subheading',
      //   label: 'Customize',
      //   children: []
      // },
      // {
      //   type: 'link',
      //   label: 'Configuration',
      //   route: () => this.layoutService.openConfigpanel(),
      //   icon: 'mat:settings'
      // }
    ]);
  }
}