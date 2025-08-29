// AG Grid module registration
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// This file should be imported once at the root of your application
// to ensure AG Grid modules are registered before any grid components are used