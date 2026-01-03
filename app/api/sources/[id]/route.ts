import { NextRequest, NextResponse } from "next/server";
import { deleteSource, updateSource, getSourceById } from "@/lib/db/queries";
import { UpdateSourceRequest, UpdateSourceResponse, DeleteSourceResponse } from "@/types/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    deleteSource(id);

    const response: DeleteSourceResponse = {
      success: true,
      message: "Source deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Delete source error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete source",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateSourceRequest = await request.json();

    updateSource(id, { enabled: body.enabled });

    const updatedSource = getSourceById(id);

    if (!updatedSource) {
      return NextResponse.json(
        { success: false, error: "Source not found" },
        { status: 404 }
      );
    }

    const response: UpdateSourceResponse = {
      success: true,
      source: updatedSource,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Update source error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update source",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
