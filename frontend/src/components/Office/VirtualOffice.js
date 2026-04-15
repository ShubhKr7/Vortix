"use client";
"use client";
import React from "react";
import useAuthStore from "@/store/authStore";
import useWorkspaceStore from "@/store/workspaceStore";
import OfficeCanvas from "./Canvas";
import LiveKitManager from "../Audio/LiveKitManager";

const VirtualOffice = React.forwardRef(({ workspaceId, muted, cameraEnabled }, ref) => {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  if (!user || !currentWorkspace) return null;

  return (
    <>
      <OfficeCanvas 
        ref={ref}
        userId={user.id} 
        userName={user.name} 
        layout={currentWorkspace.layout} 
      />
      <LiveKitManager 
        workspaceId={workspaceId} 
        muted={muted} 
        cameraEnabled={cameraEnabled} 
        layout={currentWorkspace.layout} 
      />
    </>
  );
});

export default VirtualOffice;
