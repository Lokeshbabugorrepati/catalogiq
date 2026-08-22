import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ExplainableField from "../components/ExplainableField";

const FIELD_LABELS = [
  ["title", "Title"], ["brand", "Brand"], ["category", "Category"],
  ["description", "Description"], ["material", "Material"], ["dimensions", "Dimensions"],
  ["certifications", "Certifications"], ["price", "Price"], ["keywords", "Keywords"],
];

export default function ProductReview() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const load = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data);
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (fieldName, value) => {
    await api.patch(`/products/${id}/field`, { fieldName, value });
    load();
  };

  const handleApprove = async (fieldName) => {
    await api.patch(`/products/${id}/approve`, { fieldNames: [fieldName] });
    load();
  };

  const handleRevalidate = async (fieldName) => {
    const { data } = await api.post(`/products/${id}/revalidate`, { fieldName });
    // defensive: normalize in case the AI returns a 0-1 fraction instead of 0-100
    const confidence = data.confidence <= 1 ? Math.round(data.confidence * 100) : Math.round(data.confidence);
    alert(`AI check: ${data.isSupported ? "Supported" : "Not fully supported"} (${confidence}%)\n${data.explanation}`);
  };

  if (!product) return <p className="p-8">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{product.title?.value}</h1>
          <p className="text-sm text-slate-500">Data quality score: {product.overallQualityScore}% · Status: {product.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELD_LABELS.map(([key, label]) => (
          <ExplainableField
            key={key}
            fieldKey={key}
            label={label}
            field={product[key]}
            onSave={handleSave}
            onApprove={handleApprove}
            onRevalidate={handleRevalidate}
          />
        ))}
      </div>
    </div>
  );
}
