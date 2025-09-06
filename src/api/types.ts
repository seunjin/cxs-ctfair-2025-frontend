export interface FaceDetectResponse {
  error_code: number;
  error_msg: string;
  landmarks: number[][];
  landmarks_str: string;
  region: number[];
  seconds: number;
  trx_id: string;
}
