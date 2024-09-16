import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/app/_components/shadcn/ui/dialog";
import { Button } from "@/app/_components/shadcn/ui/button";

type Props = {
  isOpen: boolean;
  title: string;
  description: string;
  submitAction: () => void;
  close: () => void;
};

export const ConfirmDialog: React.FC<Props> = (props) => {
  const { isOpen, close, title, description, submitAction } = props;
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={submitAction}>
            OK
          </Button>
          <DialogClose asChild>
            <Button variant="default" autoFocus>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
