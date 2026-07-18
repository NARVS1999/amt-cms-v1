<?php

namespace App\Domains\Marketing\Filament\Resources;

use App\Domains\Marketing\Filament\Resources\PageResource\Pages\CreatePage;
use App\Domains\Marketing\Filament\Resources\PageResource\Pages\EditPage;
use App\Domains\Marketing\Filament\Resources\PageResource\Pages\ListPages;
use App\Domains\Marketing\Models\Page;
use Filament\Forms;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class PageResource extends Resource
{
    protected static ?string $model = Page::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-document';

    protected static string | \UnitEnum | null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Pages';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->reactive()
                    ->afterStateUpdated(function (Set $set, ?string $state, Get $get) {
                        // Auto-generate slug only when slug field is empty (create) or untouched
                        if (blank($get('slug'))) {
                            $set('slug', str()->slug($state ?? ''));
                        }
                    }),
                Forms\Components\TextInput::make('slug')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true)
                    ->rule('regex:/^[a-z0-9-]+$/')
                    ->validationMessage('Slug may only contain lowercase letters, numbers, and hyphens.')
                    ->helperText('Auto-generated from title. Can be edited.'),
                Forms\Components\TextInput::make('hero_heading')
                    ->maxLength(255)
                    ->label('Hero Heading'),
                Forms\Components\TextInput::make('hero_subtext')
                    ->maxLength(255)
                    ->label('Hero Subtext'),
                Forms\Components\Textarea::make('sections')
                    ->rows(8)
                    ->helperText('Enter JSON array of section objects: [{ "type": "hero", "heading": "...", "content": "...", "image": "..." }]')
                    ->rules(['json'])
                    ->formatStateUsing(function ($state): string {
                        if (is_string($state)) return $state;
                        if (is_array($state)) return json_encode($state, JSON_PRETTY_PRINT);
                        return '';
                    }),
                Forms\Components\Toggle::make('is_published')
                    ->inline(false)
                    ->label('Published'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Slug copied'),
                Tables\Columns\IconColumn::make('is_published')
                    ->boolean()
                    ->label('Status')
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->getStateUsing(fn (Page $record): string => $record->is_published ? 'Published' : 'Draft'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->date()
                    ->sortable()
                    ->label('Updated'),
            ])
            ->defaultSort('id', 'asc')
            ->paginated(false)
            ->emptyStateHeading('No pages yet')
            ->emptyStateDescription('Create your first one.')
            ->emptyStateIcon('heroicon-o-document')
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->modalHeading('Delete page')
                    ->modalDescription('Are you sure you want to delete this page? This action cannot be undone.')
                    ->modalSubmitActionLabel('Delete')
                    ->successNotificationTitle('Deleted.'),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPages::route('/'),
            'create' => CreatePage::route('/create'),
            'edit' => EditPage::route('/{record}/edit'),
        ];
    }
}
