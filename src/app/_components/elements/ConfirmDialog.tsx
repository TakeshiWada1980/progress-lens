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
import { Dispatch, SetStateAction } from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
  description: string;
  submitAction: () => void;
};

export const ConfirmDialog: React.FC<Props> = (props) => {
  const { isOpen, setIsOpen, title, description, submitAction } = props;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
