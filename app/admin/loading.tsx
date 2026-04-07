import Spinner from "@/components/ui/Spinner";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-sm font-medium text-gray-500 animate-pulse">
                    Cargando panel...
                </p>
            </div>
        </div>
    );
}
