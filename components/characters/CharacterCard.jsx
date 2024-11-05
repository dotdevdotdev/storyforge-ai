export const CharacterCard = ({ data, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{data.name}</h3>
          {data.fullName && (
            <p className="text-sm text-gray-600">
              {`${data.fullName.firstName} ${data.fullName.lastName}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(data)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(data.id)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
        {data.description || data.appearance || "No description available"}
      </p>
    </div>
  );
};
