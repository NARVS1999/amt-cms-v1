<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Facades\Filament;
use Filament\Navigation\NavigationGroup;
use Filament\Navigation\NavigationItem;
use Filament\Navigation\NavigationBuilder;
use App\Domains\Marketing\Filament\Resources\ServiceResource;
use App\Filament\Pages\MediaLibrary;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::hex('#FF0000'),
            ])
            ->font('Inter')
            ->navigation(function (NavigationBuilder $builder): NavigationBuilder {
                return $builder
                    ->groups([
                        NavigationGroup::make('Main')
                            ->icon('heroicon-o-home')
                            ->items([
                                NavigationItem::make('Dashboard')
                                    ->icon('heroicon-o-home')
                                    ->url(fn (): string => Dashboard::getUrl()),
                                NavigationItem::make('Services')
                                    ->icon('heroicon-o-cog-6-tooth')
                                    ->url(fn (): string => ServiceResource::getUrl())
                                    ->group('Main'),
                                NavigationItem::make('Team')
                                    ->icon('heroicon-o-users')
                                    ->url('#')
                                    ->group('Main'),
                                NavigationItem::make('Blog')
                                    ->icon('heroicon-o-document-text')
                                    ->url('#')
                                    ->group('Main'),
                                NavigationItem::make('Pricing')
                                    ->icon('heroicon-o-currency-dollar')
                                    ->url('#')
                                    ->group('Main'),
                            ]),
                        NavigationGroup::make('Leads')
                            ->icon('heroicon-o-envelope')
                            ->collapsed()
                            ->items([
                                NavigationItem::make('Messages')
                                    ->icon('heroicon-o-envelope')
                                    ->url('#')
                                    ->group('Leads'),
                                NavigationItem::make('Subscribers')
                                    ->icon('heroicon-o-user-group')
                                    ->url('#')
                                    ->group('Leads'),
                            ]),
                        NavigationGroup::make('Settings')
                            ->icon('heroicon-o-cog-6-tooth')
                            ->collapsed()
                            ->items([
                                NavigationItem::make('Theme')
                                    ->icon('heroicon-o-paint-brush')
                                    ->url('#')
                                    ->group('Settings'),
                                NavigationItem::make('Media Library')
                                    ->icon('heroicon-o-photo')
                                    ->url(fn (): string => MediaLibrary::getUrl())
                                    ->group('Settings'),
                                NavigationItem::make('Pages')
                                    ->icon('heroicon-o-document')
                                    ->url('#')
                                    ->group('Settings'),
                            ]),
                    ]);
            })
            ->resources([
                ServiceResource::class,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
                MediaLibrary::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
                FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->viteTheme('resources/css/filament/admin/theme.css');
    }
}
