import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import * as React from 'react';
import { Drawer } from '@workspace/ui/components/drawer';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@workspace/ui/components/drawer';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';

export function Modal({
  children,
  open,
  setOpen,
  title,
  description,
  trigger,
  footer,
}: {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  trigger: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className='sm:max-w-[425px] bg-white'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className='max-h-[80vh] overflow-y-auto scrollbar-hide'>
            {children}
          </div>
          {footer && <DialogFooter className='pt-2'>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className='bg-white'>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className='max-h-[90vh] overflow-y-auto scrollbar-hide'>
          {children}
        </div>
        {footer && <DrawerFooter className='pt-2'>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
