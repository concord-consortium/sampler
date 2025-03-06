declare interface NodeModule {
  hot?: {
    accept(
      dependencies?: string | string[],
      callback?: (updatedDependencies: string[]) => void,
    ): void;
    decline(dependencies?: string | string[]): void;
    dispose(callback: (data: any) => void): void;
    addDisposeHandler(callback: (data: any) => void): void;
    removeDisposeHandler(callback: (data: any) => void): void;
    status(): string;
    addStatusHandler(callback: (status: string) => void): void;
    removeStatusHandler(callback: (status: string) => void): void;
  };
} 
