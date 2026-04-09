import { NextRequest, NextResponse } from 'next/server';
import runtime from '@/server/runtime';
import auth from '@/server/auth';
import configStore from '@/server/config-store';

const { canSaveToServer } = runtime as {
  canSaveToServer: () => boolean;
};
const { SESSION_COOKIE_NAME, isAuthenticatedCookie } = auth as {
  SESSION_COOKIE_NAME: string;
  isAuthenticatedCookie: (cookieValue: string | undefined, secret: string | undefined) => boolean;
};
const { resolveConfigPath, saveConfigYaml } = configStore as {
  resolveConfigPath: () => string;
  saveConfigYaml: (fileContents: string) => unknown;
};

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  if (!canSaveToServer()) {
    return NextResponse.json({ error: '当前模式未启用在线保存' }, { status: 404 });
  }

  const secret = process.env.COMPASS_SESSION_SECRET;
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!isAuthenticatedCookie(cookieValue, secret)) {
    return NextResponse.json({ error: '请先登录后再保存' }, { status: 401 });
  }

  const body = (await request.json()) as { yamlContent?: string };
  const yamlContent = typeof body.yamlContent === 'string' ? body.yamlContent : '';

  if (yamlContent.trim() === '') {
    return NextResponse.json({ error: 'YAML 内容不能为空' }, { status: 400 });
  }

  try {
    saveConfigYaml(yamlContent);

    return NextResponse.json({
      ok: true,
      configPath: resolveConfigPath(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '保存配置失败',
      },
      { status: 400 },
    );
  }
}
