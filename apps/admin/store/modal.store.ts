import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type TAlertProps = {
	description?: string
	title?: string
	okText?: string
	onConfirm?: () => void
}

// Use a generic for modalProps in the state and openModal
type TModalState = {
	isOpen?: boolean
	editMode?: boolean
	isFormActive?: boolean
	isAlertActive?: boolean
	modalKey?: string
	modalProps?: object
	openModal: (payload: {
		modalKey: string
		modalProps?: object
	}) => void
	closeModal: () => void
	alertProps: TAlertProps
	openForm: () => void
	closeForm: () => void
	openAlertModal: (payload?: TAlertProps) => void
	closeAlertModal: () => void
}

const initialState = {
	isOpen: false,
	isAlertActive: false,
	editMode: false,
	alertProps: {
		title: 'Delete',
		description: 'Are you sure you want to delete this item? This action cannot be undone.',
		okText: 'Yes, Delete',
	},
	modalProps: undefined,
}

export const useModalStore = create<TModalState>()(
	persist(
		(set) => ({
			...initialState,
			openForm: () =>
				set((state) => ({
					...state,
					isFormActive: true,
				})),
			openModal: ({
				modalKey,
				modalProps,
			}: {
				modalKey: string
				modalProps?: object
			}) =>
				set((state) => ({
					...state,
					modalProps,
					modalKey,
				})),
			closeModal: () =>
				set((state) => ({
					...state,
					modalProps: undefined,
					modalKey: undefined,
				})),
			closeForm: () =>
				set((state) => ({
					...state,
					isFormActive: false,
				})),
			openAlertModal: (payload?: TAlertProps) =>
				set((state) => ({
					...state,
					alertProps: { ...state.alertProps, ...payload },
					isAlertActive: true,
				})),
			closeAlertModal: () =>
				set((state) => ({
					...state,
					isAlertActive: false,
				})),
		}),
		{
			name: 'modal-store',
			storage: createJSONStorage(() => sessionStorage),
			partialize: ({ isFormActive }) => ({ isFormActive }),
		},
	),
)
// For backward compatibility, you can export a default instance with the default type
// export const useModalStore = storeInitializer<T>()
