import { useModalStore } from "@/store"
import { useMemo } from "react"

export const useModalState = <T extends object = object>(
	key: string,
): {
	open?: boolean
	close: () => void
	modalProps?: T
} => {
	const modalKey = useModalStore(({ modalKey }) => modalKey)
	const closeModal = useModalStore(({ closeModal }) => closeModal)
	const modalProps = useModalStore(({ modalProps }) => modalProps) as T

	return useMemo(() => {
		return {
			open: modalKey === key,
			close: closeModal,
			modalProps,
		}
	}, [modalKey, key, closeModal, modalProps])
}
