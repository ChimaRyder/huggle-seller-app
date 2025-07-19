import { AArrowDown, Camera, icons, LucideIcon } from 'lucide-react-native';

interface IconProps {
    name: string,
    color: string,
    size: number
}

const Icon = ({ name, color, size }: IconProps) => {
  const LucIcon = (icons as Record<string, LucideIcon | undefined>)[name];
  if (!LucIcon) {
    return null;
  }
  return <LucIcon color={color} size={size} />;
};

export default Icon;