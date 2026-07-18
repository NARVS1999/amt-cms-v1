<?php

namespace App\Domains\Marketing\Filament\Resources;

use App\Domains\Marketing\Filament\Resources\TeamMemberResource\Pages\CreateTeamMember;
use App\Domains\Marketing\Filament\Resources\TeamMemberResource\Pages\EditTeamMember;
use App\Domains\Marketing\Filament\Resources\TeamMemberResource\Pages\ListTeamMembers;
use App\Domains\Marketing\Models\TeamMember;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TeamMemberResource extends Resource
{
    protected static ?string $model = TeamMember::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-users';

    protected static string | \UnitEnum | null $navigationGroup = 'Main';

    protected static ?string $navigationLabel = 'Team';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('role')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('bio')
                    ->rows(4)
                    ->maxLength(65535),
                Forms\Components\SpatieMediaLibraryFileUpload::make('photo')
                    ->collection('photo')
                    ->conversion('thumb')
                    ->image()
                    ->maxSize(2048)
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                    ->label('Photo'),
                Forms\Components\KeyValue::make('social_links')
                    ->keyLabel('Platform')
                    ->valueLabel('URL')
                    ->addActionLabel('Add social link')
                    ->default(['linkedin' => '', 'twitter' => ''])
                    ->rules(['json']),
                Forms\Components\Hidden::make('sort_order')
                    ->default(0),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('photo')
                    ->circular()
                    ->size(40)
                    ->getStateUsing(function (TeamMember $record): ?string {
                        return $record->getFirstMediaUrl('photo', 'thumb') ?: null;
                    }),

                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('role')
                    ->searchable(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->sortable()
                    ->label('Sort Order'),
                Tables\Columns\TextColumn::make('created_at')
                    ->date()
                    ->sortable()
                    ->label('Created'),
            ])
            ->defaultSort('sort_order', 'asc')
            ->reorderable('sort_order')
            ->paginated(false)
            ->emptyStateHeading('No team members yet')
            ->emptyStateDescription('Create your first one.')
            ->emptyStateIcon('heroicon-o-users')
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->modalHeading('Delete team member')
                    ->modalDescription('Are you sure you want to delete this team member? This action cannot be undone.')
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
            'index' => ListTeamMembers::route('/'),
            'create' => CreateTeamMember::route('/create'),
            'edit' => EditTeamMember::route('/{record}/edit'),
        ];
    }
}
