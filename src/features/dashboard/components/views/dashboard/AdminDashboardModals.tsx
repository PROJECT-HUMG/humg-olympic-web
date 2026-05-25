import {
    AdminBadgeUpsertRequest,
    AdminCreateUserRequest,
    AdminFacultyUpsertRequest,
    AdminUniversityUpsertRequest,
    AdminUpdateUserRequest,
    AdminResourceCategoryUpsertRequest,
    AdminSubjectUpsertRequest,
    AdminForumCategoryUpsertRequest,
    AdminHeroSlideUpsertRequest,
} from '@/features/admin/types/admin.types';
import {
    AdminBadgeModal,
    AdminFacultyModal,
    AdminUniversityModal,
    AdminUserModal,
    AdminResourceCategoryModal,
    AdminSubjectModal,
    AdminForumCategoryModal,
    AdminHeroSlideModal,
} from '@/features/dashboard/components/admin/AdminManagementModals';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminBadgeExcelUploadModal } from '@/features/dashboard/components/admin/AdminBadgeExcelUploadModal';
import { AdminGrantBadgeModal } from '@/features/dashboard/components/admin/AdminGrantBadgeModal';
import { AdminUserBadgesModal } from '@/features/dashboard/components/admin/AdminUserBadgesModal';
import { AdminBroadcastModal } from '@/features/dashboard/components/admin/AdminBroadcastModal';
import { ApiNotificationRepository } from '@/features/notifications/api/ApiNotificationRepository';
import { showToast } from '@/components/ui/Toast';
import i18n from '@/i18n';

/* eslint-disable @typescript-eslint/no-explicit-any -- editingItem is a polymorphic bag from AdminDashboard */
interface EditingItem {
    id?: number;
    name?: string;
    universityId?: number;
    universityName?: string;
    facultyId?: number;
    facultyName?: string;
    [key: string]: any;
}

interface AdminDashboardModalsProps {
    activeModal: string | null;
    editingItem: EditingItem | null;
    isSubmitting: boolean;
    confirmDelete: { type: string; ids: Array<number | string> } | null;
    loadUniversitiesAsync: (search: string, page: number, limit: number) => Promise<{ data: { id: number; name: string }[]; total: number }>;
    loadFacultiesAsync: (search: string, page: number, limit: number) => Promise<{ data: { id: number; name: string }[]; total: number }>;
    onCloseModal: () => void;
    onCloseEditModal: () => void;
    onCloseConfirmDelete: () => void;
    onRefreshData: () => void;
    onDelete: (type: string, ids: Array<number | string>) => Promise<void>;
    createBadge: (data: AdminBadgeUpsertRequest) => Promise<unknown>;
    updateBadge: (id: number, data: AdminBadgeUpsertRequest) => Promise<unknown>;
    createUniversity: (data: AdminUniversityUpsertRequest) => Promise<unknown>;
    updateUniversity: (id: number, data: AdminUniversityUpsertRequest) => Promise<unknown>;
    createFaculty: (data: AdminFacultyUpsertRequest) => Promise<unknown>;
    updateFaculty: (id: number, data: AdminFacultyUpsertRequest) => Promise<unknown>;
    createUser: (data: AdminCreateUserRequest) => Promise<unknown>;
    updateUser: (id: number, data: AdminUpdateUserRequest) => Promise<unknown>;
    createResourceCategory: (data: AdminResourceCategoryUpsertRequest) => Promise<unknown>;
    updateResourceCategory: (id: number, data: AdminResourceCategoryUpsertRequest) => Promise<unknown>;
    createSubject: (data: AdminSubjectUpsertRequest) => Promise<unknown>;
    updateSubject: (id: number, data: AdminSubjectUpsertRequest) => Promise<unknown>;
    createForumCategory: (data: AdminForumCategoryUpsertRequest) => Promise<unknown>;
    updateForumCategory: (id: number, data: AdminForumCategoryUpsertRequest) => Promise<unknown>;
    createHeroSlide: (data: AdminHeroSlideUpsertRequest) => Promise<unknown>;
    updateHeroSlide: (id: number | string, data: AdminHeroSlideUpsertRequest) => Promise<unknown>;
}

export const AdminDashboardModals = ({
    activeModal, editingItem, isSubmitting, confirmDelete,
    loadUniversitiesAsync, loadFacultiesAsync,
    onCloseModal, onCloseEditModal, onCloseConfirmDelete,
    onRefreshData, onDelete,
    createBadge, updateBadge, createUniversity, updateUniversity,
    createFaculty, updateFaculty, createUser, updateUser,
    createResourceCategory, updateResourceCategory,
    createSubject, updateSubject,
    createForumCategory, updateForumCategory,
    createHeroSlide, updateHeroSlide,
}: AdminDashboardModalsProps) => (
    <>
        <AdminBadgeModal isOpen={activeModal === 'badge-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            onSubmit={async (p) => { await createBadge(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} />
        <AdminBadgeModal isOpen={activeModal === 'badge-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            initialId={editingItem?.id} initialValues={editingItem as any ?? undefined}
            onSubmit={async (p, id) => { if (id) { await updateBadge(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); } }} />
        <AdminUniversityModal isOpen={activeModal === 'university-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            onSubmit={async (p) => { await createUniversity(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} />
        <AdminUniversityModal isOpen={activeModal === 'university-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            onSubmit={async (p, id) => { if (id) { await updateUniversity(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); } }} />
        <AdminFacultyModal isOpen={activeModal === 'faculty-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            onSubmit={async (p) => { await createFaculty(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} />
        <AdminFacultyModal isOpen={activeModal === 'faculty-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            initialId={editingItem?.id} initialName={editingItem?.name} initialUniversityId={editingItem?.universityId}
            onSubmit={async (p, id) => { if (id) { await updateFaculty(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); } }} />
        <AdminUserModal isOpen={activeModal === 'user-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            loadUniversities={loadUniversitiesAsync} loadFaculties={loadFacultiesAsync}
            onCreate={async (p) => { await createUser(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} onUpdate={async () => undefined} />
        <AdminUserModal isOpen={activeModal === 'user-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            loadUniversities={loadUniversitiesAsync} loadFaculties={loadFacultiesAsync}
            initialUserId={editingItem?.id} initialValues={editingItem ?? undefined}
            initialUniversity={editingItem?.universityId ? { id: editingItem.universityId, name: editingItem.universityName || 'University' } : null}
            initialFaculty={editingItem?.facultyId ? { id: editingItem.facultyId, name: editingItem.facultyName || 'Faculty' } : null}
            onCreate={async () => undefined} onUpdate={async (id, p) => { await updateUser(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); }} />
        <AdminResourceCategoryModal isOpen={activeModal === 'resourceCategory-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            onSubmit={async (p) => { await createResourceCategory(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} />
        <AdminResourceCategoryModal isOpen={activeModal === 'resourceCategory-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            initialId={editingItem?.id} initialValues={editingItem as any ?? undefined}
            onSubmit={async (p, id) => { if (id) { await updateResourceCategory(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); } }} />
        <AdminSubjectModal isOpen={activeModal === 'subject-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            onSubmit={async (p) => { await createSubject(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} />
        <AdminSubjectModal isOpen={activeModal === 'subject-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            initialId={editingItem?.id} initialValues={editingItem as any ?? undefined}
            onSubmit={async (p, id) => { if (id) { await updateSubject(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); } }} />
        <AdminForumCategoryModal isOpen={activeModal === 'forumCategory-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            onSubmit={async (p) => { await createForumCategory(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} />
        <AdminForumCategoryModal isOpen={activeModal === 'forumCategory-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            initialId={editingItem?.id} initialValues={editingItem as any ?? undefined}
            onSubmit={async (p, id) => { if (id) { await updateForumCategory(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); } }} />
        <AdminHeroSlideModal isOpen={activeModal === 'heroSlide-create'} mode="create" onClose={onCloseModal} isSubmitting={isSubmitting}
            onSubmit={async (p) => { await createHeroSlide(p); showToast(i18n.t('dashboard:createSuccess'), 'success'); onRefreshData(); }} />
        <AdminHeroSlideModal isOpen={activeModal === 'heroSlide-update'} mode="update" onClose={onCloseEditModal} isSubmitting={isSubmitting}
            initialId={editingItem?.id} initialValues={editingItem as any ?? undefined}
            onSubmit={async (p, id) => { if (id) { await updateHeroSlide(id, p); showToast(i18n.t('dashboard:updateSuccess'), 'success'); onRefreshData(); } }} />
        <ConfirmModal isOpen={!!confirmDelete} onClose={onCloseConfirmDelete}
            onConfirm={async () => { if (confirmDelete) { await onDelete(confirmDelete.type, confirmDelete.ids); onCloseConfirmDelete(); } }}
            title={i18n.t('dashboard:admin.confirmDeleteTitle')} message={i18n.t('dashboard:admin.confirmDeleteMsg')} confirmText={i18n.t('dashboard:admin.confirmDeleteBtn')} variant="danger" />

        {/* Badge Management Modals */}
        <AdminBadgeExcelUploadModal
            isOpen={activeModal === 'badge-excel-upload'}
            onClose={onCloseModal}
        />
        <AdminGrantBadgeModal
            isOpen={activeModal === 'badge-grant'}
            onClose={onCloseModal}
        />
        <AdminUserBadgesModal
            isOpen={activeModal === 'user-badges'}
            onClose={onCloseEditModal}
            user={editingItem as unknown as import('@/features/admin/types/admin.types').AdminUserResponse | null}
            onSuccess={onRefreshData}
        />
        <AdminBroadcastModal
            isOpen={activeModal === 'broadcast'}
            onClose={onCloseModal}
            onSubmit={async (data) => {
                const repo = new ApiNotificationRepository();
                await repo.broadcast(data);
                showToast(i18n.t('dashboard:notificationSentSuccess'), 'success');
            }}
        />
    </>
);
