import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Upload, Play, Download, Loader2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";

export default function VideoEditor() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState<number | null>(null);

  // State for editing options
  const [editTitle, setEditTitle] = useState("");
  const [enableTrim, setEnableTrim] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [enableSubtitles, setEnableSubtitles] = useState(false);
  const [enableSilenceRemoval, setEnableSilenceRemoval] = useState(false);
  const [silenceThreshold, setSilenceThreshold] = useState(-40);
  const [enableFilters, setEnableFilters] = useState(false);
  const [filterType, setFilterType] = useState("grayscale");
  const [filterIntensity, setFilterIntensity] = useState(50);
  const [targetFormat, setTargetFormat] = useState("mp4");
  const [targetResolution, setTargetResolution] = useState("1080p");

  // Mutations
  const uploadVideoMutation = trpc.video.upload.useMutation({
    onSuccess: (data) => {
      setUploadedVideoId(data.videoId);
      toast.success(`Vídeo enviado com sucesso! ID: ${data.videoId}`);
    },
    onError: (error) => {
      toast.error(`Erro ao enviar vídeo: ${error.message}`);
    },
  });

  const startEditMutation = trpc.video.startEdit.useMutation({
    onSuccess: (data) => {
      toast.success("Edição iniciada! Seu vídeo está sendo processado...");
    },
    onError: (error) => {
      toast.error(`Erro ao iniciar edição: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Arquivo muito grande! Máximo de 500MB permitido");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Tipo de arquivo inválido! Por favor, selecione um arquivo de vídeo");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadVideo = async () => {
    if (!selectedFile || !user) return;

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];

        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Call mutation to upload video
        await uploadVideoMutation.mutateAsync({
          filename: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          fileData: base64Data,
        });

        clearInterval(interval);
        setUploadProgress(100);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress(0);
    }
  };

  const handleStartEdit = async () => {
    if (!uploadedVideoId || !user) return;

    try {
      await startEditMutation.mutateAsync({
        videoId: uploadedVideoId,
        editTitle,
        enableTrim,
        trimStart,
        trimEnd,
        enableSubtitles,
        enableSilenceRemoval,
        silenceThreshold,
        enableFilters,
        filterType,
        filterIntensity,
        targetFormat,
        targetResolution,
      });
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Auto Video Editor</h1>
          <p className="text-slate-300">Edite seus vídeos automaticamente com IA</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload de Vídeo</CardTitle>
                <CardDescription>Selecione um vídeo para editar (máx. 500MB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-slate-500 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-4 text-slate-400" size={32} />
                  <p className="text-white font-medium mb-2">Clique para selecionar ou arraste um vídeo</p>
                  <p className="text-slate-400 text-sm">Formatos suportados: MP4, WebM, MOV, AVI</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Video Preview */}
                {videoPreview && (
                  <div className="space-y-2">
                    <Label className="text-white">Prévia do Vídeo</Label>
                    <video
                      src={videoPreview}
                      controls
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Enviando...</span>
                      <span className="text-slate-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUploadVideo}
                  disabled={!selectedFile || uploadVideoMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {uploadVideoMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Enviar Vídeo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Edit Options Section */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Opções de Edição</CardTitle>
                <CardDescription>Configure as edições automáticas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Edit Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      Título da Edição
                    </Label>
                    <Input
                      id="title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Ex: Vídeo para Instagram"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Format and Resolution */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Formato</Label>
                      <Select value={targetFormat} onValueChange={setTargetFormat}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                          <SelectItem value="mov">MOV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Resolução</Label>
                      <Select value={targetResolution} onValueChange={setTargetResolution}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                          <SelectItem value="2k">2K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Trim */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trim"
                        checked={enableTrim}
                        onCheckedChange={(checked) => setEnableTrim(checked as boolean)}
                      />
                      <Label htmlFor="trim" className="text-white cursor-pointer">
                        Cortar Vídeo
                      </Label>
                    </div>
                    {enableTrim && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <Label className="text-slate-300">Início: {trimStart}s</Label>
                          <Slider
                            value={[trimStart]}
                            onValueChange={(v) => setTrimStart(v[0])}
                            max={300}
                            step={1}
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Fim: {trimEnd}s</Label>
                          <Slider
                            value={[trimEnd]}
                            onValueChange={(v) => setTrimEnd(v[0])}
                            max={300}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subtitles */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="subtitles"
                      checked={enableSubtitles}
                      onCheckedChange={(checked) => setEnableSubtitles(checked as boolean)}
                    />
                    <Label htmlFor="subtitles" className="text-white cursor-pointer">
                      Adicionar Legendas
                    </Label>
                  </div>

                  {/* Silence Removal */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="silence"
                        checked={enableSilenceRemoval}
                        onCheckedChange={(checked) => setEnableSilenceRemoval(checked as boolean)}
                      />
                      <Label htmlFor="silence" className="text-white cursor-pointer">
                        Remover Silêncios
                      </Label>
                    </div>
                    {enableSilenceRemoval && (
                      <div className="space-y-2 text-sm">
                        <Label className="text-slate-300">Limite: {silenceThreshold}dB</Label>
                        <Slider
                          value={[silenceThreshold]}
                          onValueChange={(v) => setSilenceThreshold(v[0])}
                          min={-60}
                          max={0}
                          step={1}
                        />
                      </div>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filters"
                        checked={enableFilters}
                        onCheckedChange={(checked) => setEnableFilters(checked as boolean)}
                      />
                      <Label htmlFor="filters" className="text-white cursor-pointer">
                        Aplicar Filtros
                      </Label>
                    </div>
                    {enableFilters && (
                      <div className="space-y-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grayscale">Escala de Cinza</SelectItem>
                            <SelectItem value="blur">Desfoque</SelectItem>
                            <SelectItem value="brightness">Brilho</SelectItem>
                            <SelectItem value="contrast">Contraste</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="space-y-1">
                          <Label className="text-slate-300 text-sm">Intensidade: {filterIntensity}%</Label>
                          <Slider
                            value={[filterIntensity]}
                            onValueChange={(v) => setFilterIntensity(v[0])}
                            max={100}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Start Edit Button */}
        {uploadedVideoId && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleStartEdit}
              disabled={startEditMutation.isPending}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {startEditMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Processando...
                </>
              ) : (
                <>
                  <Play className="mr-2" size={18} />
                  Iniciar Edição
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
