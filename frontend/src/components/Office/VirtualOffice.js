"use client";
import useAuthStore from "@/store/authStore";
import useWorkspaceStore from "@/store/workspaceStore";
import OfficeCanvas from "./Canvas";
import LiveKitManager from "../Audio/LiveKitManager";

export default function VirtualOffice({ workspaceId, muted }) {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  if (!user || !currentWorkspace) return null;

  return (
    <>
      <OfficeCanvas 
        userId={user.id} 
        userName={user.name} 
        layout={currentWorkspace.layout} 
      />
      <LiveKitManager workspaceId={workspaceId} muted={muted} />
    </>
  );
}
