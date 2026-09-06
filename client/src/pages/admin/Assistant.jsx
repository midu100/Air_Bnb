import React from 'react';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import AssistantChat from '../../components/admin/AssistantChat';

const Assistant = () => {
  return (
    <div className="space-y-6 text-black">
      <div className="border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Business Assistant"
          des="Ask about performance, and it proposes changes you confirm"
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded shadow-xs" style={{ height: 640 }}>
        <AssistantChat autoFocus />
      </div>

      <p className="text-[12px] text-neutral-400 font-semibold">
        The assistant reads only your own listings and bookings. It cannot change anything on its own —
        every change is queued above for you to confirm, and validated again when you do.
      </p>
    </div>
  );
};

export default Assistant;
