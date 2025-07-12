import { useModalStore } from "@/lib/store";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@radix-ui/react-alert-dialog";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@workspace/ui/components/alert-dialog";

const ConfirmDialog = () => {
  const open = useModalStore(({ isAlertActive }) => isAlertActive);
  const closeAlertModal = useModalStore(
    ({ closeAlertModal }) => closeAlertModal
  );
  const props = useModalStore(({ alertProps }) => alertProps);

  const { title, description, okText, onConfirm } = props;

  return (
    <AlertDialog
      open={open}
      onOpenChange={closeAlertModal}
      aria-describedby="Confirm Dialog"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="pb-5">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              onConfirm?.();
            }}
          >
            {okText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
