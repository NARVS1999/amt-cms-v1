<?php

namespace App\Domains\Marketing\Filament\Resources;

use App\Domains\Marketing\Filament\Resources\ServiceResource\Pages\CreateService;
use App\Domains\Marketing\Filament\Resources\ServiceResource\Pages\EditService;
use App\Domains\Marketing\Filament\Resources\ServiceResource\Pages\ListServices;
use App\Domains\Marketing\Models\Service;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class ServiceResource extends Resource
{
    protected static ?string $model = Service::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static string | \UnitEnum | null $navigationGroup = 'Main';

    protected static ?string $navigationLabel = 'Services';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('description')
                    ->required()
                    ->rows(4)
                    ->maxLength(65535),
                Forms\Components\TextInput::make('icon')
                    ->required()
                    ->maxLength(255)
                    ->helperText('Enter Font Awesome class e.g. fa-solid fa-code'),
                Forms\Components\Toggle::make('is_featured')
                    ->inline(false),
                Forms\Components\Hidden::make('sort_order')
                    ->default(0),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('icon')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Icon class copied'),
                Tables\Columns\TextColumn::make('sort_order')
                    ->sortable()
                    ->label('Sort Order'),
                Tables\Columns\IconColumn::make('is_featured')
                    ->boolean()
                    ->label('Featured'),
                Tables\Columns\TextColumn::make('created_at')
                    ->date()
                    ->sortable()
                    ->label('Created'),
            ])
            ->defaultSort('sort_order', 'asc')
            ->reorderable('sort_order')
            ->paginated(false)
            ->emptyStateHeading('No services yet')
            ->emptyStateDescription('Create your first one.')
            ->emptyStateIcon('heroicon-o-cog-6-tooth')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Featured'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->modalHeading('Delete service')
                    ->modalDescription('Are you sure you want to delete this service? This action cannot be undone.')
                    ->modalSubmitActionLabel('Delete')
                    ->successNotificationTitle('Deleted.'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
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
            'index' => ListServices::route('/'),
            'create' => CreateService::route('/create'),
            'edit' => EditService::route('/{record}/edit'),
        ];
    }
}
