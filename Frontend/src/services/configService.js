const MODELS = [
  { id: "gemini-pro", name: "Google Gemini Pro", description: "Default multicapable model", capabilities: ["text", "code"] },
  { id: "gpt-4", name: "OpenAI GPT-4", description: "Advanced reasoning model", capabilities: ["text", "vision", "code"] },
  { id: "claude-3-sonnet", name: "Anthropic Claude 3", description: "Balanced performance", capabilities: ["text", "code", "nuance"] }
];

/**
 * Retrieves the current global AI configuration.
 * @returns {object} - { aiProvider, apiKey, model, temperature, maxTokens, systemPrompt }
 */
export function getAIConfig() {
  const activeModelId = localStorage.getItem("sevankur_active_model") || "gemini-pro";
  
  return {
    aiProvider: import.meta.env.VITE_AI_PROVIDER || "google",
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
    model: activeModelId,
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: "You are Sevankur AI, a municipal assistant."
  };
}

/**
 * Updates the user's local AI model choice.
 * @param {string} modelId 
 */
export function setActiveModel(modelId) {
  const modelExists = MODELS.find(m => m.id === modelId);
  if (modelExists) {
    localStorage.setItem("sevankur_active_model", modelId);
    return true;
  }
  return false;
}

/**
 * Validates and updates a subset of AI configuration locally.
 * @param {object} partialConfig 
 * @returns {object} updated full config
 */
export function updateAIConfig(partialConfig) {
  // Validation logic
  if (partialConfig.temperature && (partialConfig.temperature < 0 || partialConfig.temperature > 1)) {
    throw new Error("Temperature must be between 0 and 1.");
  }
  
  // Store updates in localStorage for this session/user
  const current = getAIConfig();
  const updated = { ...current, ...partialConfig };
  
  localStorage.setItem("sevankur_temp_config", JSON.stringify(updated));
  return updated;
}

/**
 * Returns the list of pre-defined compatible models.
 * @returns {Array} 
 */
export function getAIModels() {
  return MODELS;
}
