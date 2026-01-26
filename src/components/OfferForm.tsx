import React, { useState } from 'react';
import { Offer } from '../types';
import { X } from 'lucide-react';

interface OfferFormProps {
    offer?: Offer;
    onSave: (offer: Omit<Offer, 'id'>) => void;
    onCancel: () => void;
}

export const OfferForm: React.FC<OfferFormProps> = ({ offer, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: offer?.name || '',
        shortDescription: offer?.shortDescription || '',
        fullDescription: offer?.fullDescription || '',
        deliverables: offer?.deliverables || [''],
        duration: offer?.duration || '',
        priceMin: offer?.priceRange.min || 0,
        priceMax: offer?.priceRange.max || 0,
        priceUnit: offer?.priceRange.unit || 'fixed' as const,
        targetAudience: offer?.targetAudience || [''],
        relatedCases: offer?.relatedCases || [''],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleArrayChange = (field: 'deliverables' | 'targetAudience' | 'relatedCases', index: number, value: string) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        handleChange(field, newArray);
    };

    const addArrayItem = (field: 'deliverables' | 'targetAudience' | 'relatedCases') => {
        handleChange(field, [...formData[field], '']);
    };

    const removeArrayItem = (field: 'deliverables' | 'targetAudience' | 'relatedCases', index: number) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        handleChange(field, newArray.length > 0 ? newArray : ['']);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Namn är obligatoriskt';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Kort beskrivning är obligatorisk';
        if (!formData.fullDescription.trim()) newErrors.fullDescription = 'Fullständig beskrivning är obligatorisk';
        if (!formData.duration.trim()) newErrors.duration = 'Varaktighet är obligatorisk';
        if (formData.priceMin <= 0) newErrors.priceMin = 'Minpris måste vara större än 0';
        if (formData.priceMax <= 0) newErrors.priceMax = 'Maxpris måste vara större än 0';
        if (formData.priceMax < formData.priceMin) newErrors.priceMax = 'Maxpris måste vara större än minpris';
        if (formData.deliverables.filter(d => d.trim()).length === 0) {
            newErrors.deliverables = 'Minst en leverabel krävs';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const offerData: Omit<Offer, 'id'> = {
            name: formData.name.trim(),
            shortDescription: formData.shortDescription.trim(),
            fullDescription: formData.fullDescription.trim(),
            deliverables: formData.deliverables.filter(d => d.trim()).map(d => d.trim()),
            duration: formData.duration.trim(),
            priceRange: {
                min: formData.priceMin,
                max: formData.priceMax,
                unit: formData.priceUnit,
            },
            targetAudience: formData.targetAudience.filter(t => t.trim()).map(t => t.trim()),
            relatedCases: formData.relatedCases.filter(c => c.trim()).map(c => c.trim()),
        };

        onSave(offerData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">
                        {offer ? 'Redigera erbjudande' : 'Nytt erbjudande'}
                    </h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Namn *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`w-full px-4 py-2 bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'
                                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                            placeholder="t.ex. Copilot Readiness Assessment"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Short Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Kort beskrivning *
                        </label>
                        <input
                            type="text"
                            value={formData.shortDescription}
                            onChange={(e) => handleChange('shortDescription', e.target.value)}
                            className={`w-full px-4 py-2 bg-gray-700 border ${errors.shortDescription ? 'border-red-500' : 'border-gray-600'
                                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                            placeholder="En kort sammanfattning av erbjudandet"
                        />
                        {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
                    </div>

                    {/* Full Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Fullständig beskrivning *
                        </label>
                        <textarea
                            value={formData.fullDescription}
                            onChange={(e) => handleChange('fullDescription', e.target.value)}
                            rows={4}
                            className={`w-full px-4 py-2 bg-gray-700 border ${errors.fullDescription ? 'border-red-500' : 'border-gray-600'
                                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                            placeholder="Detaljerad beskrivning av erbjudandet"
                        />
                        {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription}</p>}
                    </div>

                    {/* Deliverables */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Leverabler *
                        </label>
                        {formData.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={deliverable}
                                    onChange={(e) => handleArrayChange('deliverables', index, e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="t.ex. Teknisk bedömning av M365-miljön"
                                />
                                {formData.deliverables.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('deliverables', index)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem('deliverables')}
                            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                            + Lägg till leverabel
                        </button>
                        {errors.deliverables && <p className="text-red-500 text-sm mt-1">{errors.deliverables}</p>}
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Varaktighet *
                        </label>
                        <input
                            type="text"
                            value={formData.duration}
                            onChange={(e) => handleChange('duration', e.target.value)}
                            className={`w-full px-4 py-2 bg-gray-700 border ${errors.duration ? 'border-red-500' : 'border-gray-600'
                                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                            placeholder="t.ex. 2-3 dagar"
                        />
                        {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Minpris (kr) *
                            </label>
                            <input
                                type="number"
                                value={formData.priceMin}
                                onChange={(e) => handleChange('priceMin', Number(e.target.value))}
                                className={`w-full px-4 py-2 bg-gray-700 border ${errors.priceMin ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                            />
                            {errors.priceMin && <p className="text-red-500 text-sm mt-1">{errors.priceMin}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Maxpris (kr) *
                            </label>
                            <input
                                type="number"
                                value={formData.priceMax}
                                onChange={(e) => handleChange('priceMax', Number(e.target.value))}
                                className={`w-full px-4 py-2 bg-gray-700 border ${errors.priceMax ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                            />
                            {errors.priceMax && <p className="text-red-500 text-sm mt-1">{errors.priceMax}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Enhet
                            </label>
                            <select
                                value={formData.priceUnit}
                                onChange={(e) => handleChange('priceUnit', e.target.value as 'fixed' | 'hourly' | 'daily')}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="fixed">Fast pris</option>
                                <option value="hourly">Per timme</option>
                                <option value="daily">Per dag</option>
                            </select>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Målgrupp
                        </label>
                        {formData.targetAudience.map((audience, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={audience}
                                    onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="t.ex. IT-chefer"
                                />
                                {formData.targetAudience.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('targetAudience', index)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem('targetAudience')}
                            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                            + Lägg till målgrupp
                        </button>
                    </div>

                    {/* Related Cases */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Relaterade case (ID)
                        </label>
                        {formData.relatedCases.map((caseId, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={caseId}
                                    onChange={(e) => handleArrayChange('relatedCases', index, e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="t.ex. stena-copilot"
                                />
                                {formData.relatedCases.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('relatedCases', index)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem('relatedCases')}
                            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                            + Lägg till case
                        </button>
                    </div>
                </form>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Spara
                    </button>
                </div>
            </div>
        </div>
    );
};
