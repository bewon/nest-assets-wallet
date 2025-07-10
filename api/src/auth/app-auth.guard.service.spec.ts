import { AppAuthGuard } from './app-auth.guard.service';

describe('JwtAuthGuard', () => {
    it('should be defined', () => {
        expect(new AppAuthGuard(null as any)).toBeDefined();
    });
}); 