import { Button } from "../ui/button";

export const PageHeader = ({
  title,
  description,
  onAdd,
  addButtonText = "Add New",
}) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button onClick={onAdd} variant="default">
          {addButtonText}
        </Button>
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};
