import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { OfferForm } from './OfferForm';
import { Offer } from '../types';
import { Plus, Edit2, Trash2, X, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const { offers, addOffer, updateOffer, deleteOffer, resetOffers } = useOfferStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | undefined>(undefined);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleAddOffer = () => {
        setEditingOffer(undefined);
        setIsFormOpen(true);
    };

    const handleEditOffer = (offer: Offer) => {
        setEditingOffer(offer);
        setIsFormOpen(true);
    };

    const handleSaveOffer = (offerData: Omit<Offer, 'id'>) => {
        if (editingOffer) {
            updateOffer(editingOffer.id, offerData);
        } else {
            addOffer(offerData);
        }
        setIsFormOpen(false);
        setEditingOffer(undefined);
    };

    const handleDeleteOffer = (id: string) => {
        deleteOffer(id);
        setDeleteConfirm(null);
    };

    const handleResetOffers = () => {
        if (window.confirm('Är du säker på att du vill återställa alla erbjudanden till standardvärdena? Detta kan inte ångras.')) {
            resetOffers();
        }
    };

    const formatPrice = (priceRange: Offer['priceRange']) => {
        const { min, max, unit } = priceRange;
        const unitText = unit === 'fixed' ? 'kr' : unit === 'hourly' ? 'kr/tim' : 'kr/dag';
        if (min === max) {
            return `${min.toLocaleString('sv-SE')} ${unitText}`;
        }
        return `${min.toLocaleString('sv-SE')} - ${max.toLocaleString('sv-SE')} ${unitText}`;
    };

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Hantera erbjudanden</h1>
                        <p className="text-gray-400">Lägg till, redigera eller ta bort erbjudanden</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleResetOffers}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                        >
                            <RotateCcw size={18} />
                            Återställ
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                        >
                            <X size={18} />
                            Stäng
                        </button>
                    </div>
                </div>

                {/* Add Offer Button */}
                <div className="mb-6">
                    <button
                        onClick={handleAddOffer}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium"
                    >
                        <Plus size={20} />
                        Lägg till nytt erbjudande
                    </button>
                </div>

                {/* Offers List */}
                <div className="grid gap-4">
                    {offers.length === 0 ? (
                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                            <p className="text-gray-400">Inga erbjudanden finns. Lägg till ett nytt erbjudande för att komma igång.</p>
                        </div>
                    ) : (
                        offers.map((offer) => (
                            <div key={offer.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{offer.name}</h3>
                                        <p className="text-gray-300 mb-3">{offer.shortDescription}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase">Pris</span>
                                                <p className="text-white font-medium">{formatPrice(offer.priceRange)}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase">Varaktighet</span>
                                                <p className="text-white font-medium">{offer.duration}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-xs text-gray-400 uppercase block mb-2">Leverabler</span>
                                            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                                {offer.deliverables.slice(0, 3).map((deliverable, idx) => (
                                                    <li key={idx}>{deliverable}</li>
                                                ))}
                                                {offer.deliverables.length > 3 && (
                                                    <li className="text-gray-500">+{offer.deliverables.length - 3} till...</li>
                                                )}
                                            </ul>
                                        </div>

                                        {offer.targetAudience.length > 0 && (
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase block mb-2">Målgrupp</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {offer.targetAudience.map((audience, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                                                            {audience}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEditOffer(offer)}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                            title="Redigera"
                                        >
                                            <Edit2 size={18} />
                                        </button>

                                        {deleteConfirm === offer.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDeleteOffer(offer.id)}
                                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                                                >
                                                    Bekräfta
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                                                >
                                                    Avbryt
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(offer.id)}
                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                                title="Ta bort"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <OfferForm
                    offer={editingOffer}
                    onSave={handleSaveOffer}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingOffer(undefined);
                    }}
                />
            )}
        </div>
    );
};
