export default function TimeUpModal({ show, onClose, onAction, bothButtonsSubmit = false }) {
  if (!show) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  const handleClose = () => {
    if (bothButtonsSubmit && onAction) {
      onAction();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-[92%] p-6 text-center">
        <div className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: "Nunito"}}>Đã hết giờ làm bài phần</div>
        <div className="text-2xl font-extrabold text-[#3563E9] mb-6" style={{fontFamily: "UD Digi Kyokasho N-B"}}>言語知識</div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleAction}
            className="px-5 py-2.5 rounded-lg bg-[#5B6CFF] text-white font-semibold hover:bg-[#4958f0] transition-colors"
            style={{fontFamily: "Nunito"}}
          >
            Chuyển sang phần Nghe 
          </button>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            style={{fontFamily: "Nunito"}}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}


