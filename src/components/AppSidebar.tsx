import { LayoutDashboard, UserPlus, ScanLine, Users, Dumbbell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Add Member", url: "/add-member", icon: UserPlus },
  { title: "Check-In", url: "/check-in", icon: ScanLine },
  { title: "All Members", url: "/members", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <div className={`p-4 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <Dumbbell className="h-7 w-7 neon-text-teal shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-display font-bold neon-text-teal leading-none">GymFit</h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest">DOCTOR</p>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-mono text-[10px] tracking-widest">
            {!collapsed && "NAVIGATION"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50 transition-colors"
                      activeClassName="bg-muted neon-text-teal font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
