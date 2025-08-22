import { useState } from 'react';
import { useDebug } from '@/providers/DebugProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bug, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DebugPanel = () => {
  const { isDebugMode, debugInfo, clearDebugInfo } = useDebug();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isDebugMode) return null;

  const copyDebugInfo = () => {
    const debugText = debugInfo.map(info => 
      `[${info.timestamp.toLocaleTimeString()}] ${info.message}${info.data ? ` - ${JSON.stringify(info.data)}` : ''}`
    ).join('\n');
    
    navigator.clipboard.writeText(debugText);
    toast({
      title: "Debug info copiada",
      description: "Informações de debug foram copiadas para a área de transferência.",
    });
  };

  const getPerformanceInfo = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0),
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  };

  const performanceInfo = getPerformanceInfo();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="border border-destructive/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-destructive" />
              Debug Panel
              <Badge variant="destructive" className="text-xs">
                DEV
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-3">
            {/* Performance Info */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Performance</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Load: {performanceInfo.loadTime}ms</div>
                <div>DOM: {performanceInfo.domContentLoaded}ms</div>
                {performanceInfo.memory && (
                  <>
                    <div>Memória: {performanceInfo.memory.used}MB</div>
                    <div>Limite: {performanceInfo.memory.limit}MB</div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Debug Logs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold">Logs ({debugInfo.length})</h4>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={copyDebugInfo}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearDebugInfo}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {debugInfo.slice(-20).map((info) => (
                    <div key={info.id} className="text-xs p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-muted-foreground">
                          {info.timestamp.toLocaleTimeString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {info.type}
                        </Badge>
                      </div>
                      <div className="mt-1">{info.message}</div>
                      {info.data && (
                        <pre className="mt-1 text-xs text-muted-foreground overflow-hidden">
                          {JSON.stringify(info.data, null, 2).substring(0, 100)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* System Info */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Sistema</h4>
              <div className="text-xs space-y-1">
                <div>User Agent: {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
                <div>Resolução: {window.screen.width}x{window.screen.height}</div>
                <div>Viewport: {window.innerWidth}x{window.innerHeight}</div>
                <div>Online: {navigator.onLine ? 'Sim' : 'Não'}</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};