import { Button } from "@/components/ui/button"
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { X } from "lucide-react"

const fast = "https://fast.com/";
const other = "https://www.metercustom.net/plugin/";

interface SpeedTestProps {
  onClose?: () => void;
}

export default function SpeedTest({ onClose }: SpeedTestProps) {
    return(
        <DrawerContent>
    <DrawerHeader>
        <div className="flex justify-center items-center relative">
            <DrawerTitle>Speed Test</DrawerTitle>
            <DrawerClose className="absolute right-0" onClick={onClose}>
                <X/>
            </DrawerClose>
        </div>
        <DrawerDescription>
            Test your internet speed and get insights on your connection. <b className="text-primary">INPUT YOUR DOWNLOAD SPEED IN THE INPUT FIELD</b>
        </DrawerDescription>

    </DrawerHeader>
    <iframe
        src={fast}
        width="100%"
        height="600"
    />

</DrawerContent>
    )
}