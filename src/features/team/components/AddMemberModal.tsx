import { useState, useEffect, useRef } from 'react';

import { X, UserPlus, Search, Loader2, Check } from 'lucide-react';
import { MemberRole, AddMemberPayload } from '@/features/team/types/team.types';
import { SearchUserResult, useUserSearch } from '../hooks/useUserSearch';
import i18n from '@/i18n';

interface AddMemberModalProps {
    isOpen: boolean; onClose: () => void; type: 'LECTURER' | 'STUDENT'; onSubmit: (payload: AddMemberPayload) => void; isLoading?: boolean;
}

export const AddMemberModal = ({ isOpen, onClose, type, onSubmit, isLoading = false }: AddMemberModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<MemberRole>(type === 'LECTURER' ? 'COACH' : 'MEMBER');
    const [selectedUser, setSelectedUser] = useState<SearchUserResult | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { users, loading: isSearching } = useUserSearch(searchTerm);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSelectedRole(type === 'LECTURER' ? 'COACH' : 'MEMBER');
            setSelectedUser(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, type]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedUser && !isLoading) {
            onSubmit({ userId: selectedUser.id, email: selectedUser.email, role: selectedRole });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={!isLoading ? onClose : undefined} />
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200">

                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><UserPlus size={18} /></span>
                        {i18n.t(type === 'LECTURER' ? 'features:team.addMember.addLecturer' : 'features:team.addMember.addMember')}
                    </h3>
                    <button onClick={onClose} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={20} className="text-slate-400" /></button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{i18n.t('features:team.addMember.roleLabel')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {type === 'LECTURER' ? (
                                <>
                                    <RoleCard label={i18n.t('common:teamRole.coach')} active={selectedRole === 'COACH'} onClick={() => setSelectedRole('COACH')} />
                                    <RoleCard label={i18n.t('common:teamRole.deputyCoach')} active={selectedRole === 'DEPUTY_COACH'} onClick={() => setSelectedRole('DEPUTY_COACH')} />
                                </>
                            ) : (
                                <>
                                    <RoleCard label={i18n.t('common:teamRole.member')} active={selectedRole === 'MEMBER'} onClick={() => setSelectedRole('MEMBER')} />
                                    <RoleCard label={i18n.t('common:teamRole.captain')} active={selectedRole === 'CAPTAIN'} onClick={() => setSelectedRole('CAPTAIN')} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{i18n.t('features:team.addMember.searchLabel')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                ref={inputRef} type="text" placeholder={i18n.t('features:team.addMember.searchPlaceholder')}
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors font-medium"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isLoading}
                            />
                            {isSearching && <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="min-h-[150px] max-h-[250px] overflow-y-auto">
                        {searchTerm ? (
                            <div className="space-y-2">
                                {users.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-colors ${selectedUser?.id === user.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</h4>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        {selectedUser?.id === user.id && (
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {users.length === 0 && !isSearching && <div className="text-center py-6 text-slate-400 text-sm">{i18n.t('features:team.addMember.notFound')}</div>}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400 opacity-60">
                                <Search size={32} className="mb-2" />
                                <p className="text-sm">{i18n.t('features:team.addMember.searchHint')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer with Confirm Button */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">{i18n.t('features:team.addMember.cancelBtn')}</button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedUser || isLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {i18n.t('features:team.addMember.confirmBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RoleCard = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <div onClick={onClick} className={`p-3 rounded-xl border-2 cursor-pointer transition-colors text-center ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
        <div className="flex items-center justify-center gap-2">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-600' : 'border-slate-400'}`}>
                {active && <div className="w-2 h-2 rounded-full bg-blue-600" />}
            </div>
            <span className={`font-bold text-sm ${active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
        </div>
    </div>
);