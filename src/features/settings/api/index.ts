import { SettingsRepository } from './SettingsRepository';
import { ApiSettingsRepository } from './ApiSettingsRepository';

export const settingsRepository: SettingsRepository = new ApiSettingsRepository();
