import React from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal content */}
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-md z-10 transform transition-all">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="text-2xl font-game text-game-primary">{title}</h3>
					<button
						onClick={onClose}
						className="btn btn-circle btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 border-none"
					>
						✕
					</button>
				</div>

				{/* Body */}
				<div className="p-6">{children}</div>

				{/* Footer */}
				<div className="p-4 border-t flex justify-end">
					<button
						onClick={onClose}
						className="btn bg-game-primary text-white hover:bg-opacity-90 font-game tracking-wider"
					>
						Got it!
					</button>
				</div>
			</div>
		</div>
	);
};

export default Modal;
