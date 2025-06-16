interface SkeletonLoaderProps {
  type?: 'prompt-card' | 'prompt-list' | 'text' | 'button' | 'custom';
  count?: number;
  className?: string;
  height?: string;
  width?: string;
}

export default function SkeletonLoader({ 
  type = 'prompt-card', 
  count = 3,
  className = '',
  height = 'auto',
  width = 'auto'
}: SkeletonLoaderProps) {
  
  const PromptCardSkeleton = () => (
    <div className={`theme-card rounded-3xl p-6 space-y-4 animate-pulse ${className}`}>
      {/* 헤더 영역 */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      
      {/* 콘텐츠 영역 */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      
      {/* 태그 영역 */}
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      
      {/* 푸터 영역 */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  const PromptListSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <PromptCardSkeleton key={index} />
      ))}
    </div>
  );

  const TextSkeleton = () => (
    <div 
      className={`bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${className}`}
      style={{ height, width }}
    ></div>
  );

  const ButtonSkeleton = () => (
    <div className={`h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse ${className}`}></div>
  );

  const CustomSkeleton = () => (
    <div 
      className={`bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${className}`}
      style={{ height, width }}
    ></div>
  );

  switch (type) {
    case 'prompt-card':
      return <PromptCardSkeleton />;
    case 'prompt-list':
      return <PromptListSkeleton />;
    case 'text':
      return <TextSkeleton />;
    case 'button':
      return <ButtonSkeleton />;
    case 'custom':
      return <CustomSkeleton />;
    default:
      return <PromptCardSkeleton />;
  }
} 