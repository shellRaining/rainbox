import SidebarNav from './SidebarNav';
import SidebarContent from './SidebarContent';
import SidebarFooter from './SidebarFooter';
import ResizeHandle from './ResizeHandle';
import { useSettingsStore, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from '@/stores/useSettingsStore';
import { useResizable } from '@/hooks/useResizable';

export default function Sidebar() {
  const sidebarWidth = useSettingsStore((state) => state.sidebarWidth);
  const setSidebarWidth = useSettingsStore((state) => state.setSidebarWidth);

  const { isResizing, handleMouseDown } = useResizable({
    initialWidth: sidebarWidth,
    minWidth: MIN_SIDEBAR_WIDTH,
    maxWidth: MAX_SIDEBAR_WIDTH,
    onResize: setSidebarWidth,
  });

  return (
    <div
      className="no-drag border-r bg-muted/30 flex flex-col relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      <SidebarNav />
      <SidebarContent />
      <SidebarFooter />
      <ResizeHandle isResizing={isResizing} onMouseDown={handleMouseDown} />
    </div>
  );
}
